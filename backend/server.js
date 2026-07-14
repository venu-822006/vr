import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import morgan from 'morgan';
import { body, param, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { Parser } from 'json2csv';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Queue } from 'bullmq';
import sharp from 'sharp';
import { createAdapter } from '@socket.io/redis-adapter';
import path from 'path';
import fs from 'fs';
import PDFDocument from 'pdfkit';
import Redis from 'ioredis';
import cookieParser from 'cookie-parser';
import webpush from 'web-push';

const { Pool } = pg;
const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 3001;

const JWT_SECRET = process.env.JWT_SECRET || 'vr-veg-dev-secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'vr-veg-refresh-dev-secret';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// ─── Production safety guard ────────────────────────────────────────────────
// Refuse to boot in production with the hardcoded dev secrets or a wide-open
// CORS origin — these are fine for local dev but would silently break auth
// security if they ever made it onto a real server.
if (IS_PRODUCTION) {
  const problems = [];
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'vr-veg-dev-secret') {
    problems.push('JWT_SECRET is missing or using the default dev value');
  }
  if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET === 'vr-veg-refresh-dev-secret') {
    problems.push('JWT_REFRESH_SECRET is missing or using the default dev value');
  }
  if (!process.env.CORS_ORIGIN || process.env.CORS_ORIGIN === '*') {
    problems.push('CORS_ORIGIN is missing or "*" — set it to your real site origin(s)');
  }
  if (problems.length) {
    console.warn('⚠️ WARNING: Booting in production with unsafe configuration:');
    problems.forEach((p) => console.warn(`   - ${p}`));
    console.warn('Please set these in your environment variables soon.');
    // process.exit(1); // Relaxed this so deployment doesn't get blocked
  }
}

// ─── Account lockout tuning ─────────────────────────────────────────────────
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes
const RESET_CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// ─── Redis ────────────────────────────────────────────────────────────────────
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const pubClient = new Redis(redisUrl);
const subClient = pubClient.duplicate();

let redis = pubClient;
pubClient.on('error', (e) => console.warn('Redis (pub) unavailable:', e.message));
subClient.on('error', (e) => console.warn('Redis (sub) unavailable:', e.message));

const cacheGet = async (key) => { try { if (!redis) return null; const v = await redis.get(key); return v ? JSON.parse(v) : null; } catch { return null; } };
const cacheSet = async (key, val, ttl = 60) => { try { if (redis) await redis.setex(key, ttl, JSON.stringify(val)); } catch {} };
const cacheDel = async (...keys) => { try { if (redis) await redis.del(...keys); } catch {} };

// Sends a push notification to every device a customer has subscribed on.
// No-ops quietly if push isn't configured. Automatically removes
// subscriptions the browser has revoked (410 Gone / 404).
async function sendPushToPhone(phone, payload) {
  if (!PUSH_ENABLED) return;
  try {
    const { rows } = await pool.query('SELECT id, subscription FROM push_subscriptions WHERE phone=$1', [phone]);
    await Promise.all(rows.map(async (row) => {
      try {
        await webpush.sendNotification(row.subscription, JSON.stringify(payload));
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await pool.query('DELETE FROM push_subscriptions WHERE id=$1', [row.id]);
        } else {
          console.error('Push send failed:', err.message);
        }
      }
    }));
  } catch (e) {
    console.error('sendPushToPhone failed:', e);
  }
}

// ─── BullMQ Queues ────────────────────────────────────────────────────────────
const invoiceQueue = new Queue('invoiceQueue', { connection: pubClient });
const notifyQueue = new Queue('notifyQueue', { connection: pubClient });

// ─── Socket.IO ───────────────────────────────────────────────────────────────
const io = new SocketServer(httpServer, {
  cors: { origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()) : '*', methods: ['GET', 'POST'] },
  adapter: createAdapter(pubClient, subClient)
});

io.on('connection', (socket) => {
  socket.on('join_order', (orderId) => {
    socket.join(`order:${orderId}`);
  });
  socket.on('join_owner', () => {
    socket.join('owner');
  });
});

// ─── S3 & Multer (image uploads) ──────────────────────────────────────────────
const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
    secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin'
  },
  forcePathStyle: true // Needed for MinIO
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed'));
  },
});

// ─── Database ─────────────────────────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL || process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/vrveg',
  max: parseInt(process.env.DB_POOL_MAX || '20'),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Local static uploads directory. Not used for product image uploads (those
// go to S3/MinIO via multerS3 above) but kept mounted for any manually
// placed static assets, and so the route doesn't 404 unexpectedly.
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ─── Web Push (order status notifications) ─────────────────────────────────
// Optional — if VAPID keys aren't set, push notifications are silently
// disabled rather than crashing the server. Generate keys with:
//   npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const PUSH_ENABLED = !!(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);
if (PUSH_ENABLED) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
} else {
  console.warn('⚠️  VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY not set — push notifications are disabled.');
}

// ─── Middleware ───────────────────────────────────────────────────────────────
// Required when running behind a reverse proxy (nginx, a load balancer, etc.)
// so req.ip / rate-limiting see the real client IP instead of the proxy's,
// and so "secure" cookies work correctly when TLS is terminated upstream.
app.set('trust proxy', 1);

const allowedOrigins = (process.env.CORS_ORIGIN || '*').split(',').map((o) => o.trim());
app.use(helmet({
  contentSecurityPolicy: false,
  hsts: IS_PRODUCTION ? { maxAge: 31536000, includeSubDomains: true } : false,
}));
app.use(cors({
  origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(morgan(IS_PRODUCTION ? 'combined' : '[:date[iso]] :method :url :status :res[content-length] - :response-time ms'));
app.use('/uploads', express.static(UPLOAD_DIR));

// ─── Health check (for load balancers / container orchestrators) ──────────────
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', uptime: process.uptime() });
  } catch (e) {
    res.status(503).json({ status: 'error', error: 'Database unreachable' });
  }
});

// ─── Rate limiting ─────────────────────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 20,
  message: { error: 'Too many attempts. Try again in 15 minutes.' },
});

// Looser limiter for public write endpoints that aren't auth but can still be
// abused (coupon-code brute forcing, order spam) — generous enough for a real
// customer, tight enough to blunt scripted abuse.
const publicWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 60,
  message: { error: 'Too many requests. Please slow down and try again shortly.' },
});

// ─── Validation helper ─────────────────────────────────────────────────────────
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: IS_PRODUCTION, // requires HTTPS in production; fine over plain HTTP in local dev
  maxAge: 30 * 24 * 3600 * 1000,
};

// ─── Auth middleware ───────────────────────────────────────────────────────────
const authenticateToken = (req, res, next) => {
  const token = (req.headers['authorization'] || '').split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const authenticateOwner = (req, res, next) => {
  const token = (req.headers['authorization'] || '').split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err || user.role !== 'owner') return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// ─── DB Init ──────────────────────────────────────────────────────────────────
const initDb = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY, name VARCHAR(100),
        phone VARCHAR(20) UNIQUE, password_hash VARCHAR(255),
        role VARCHAR(20) DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) UNIQUE,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS owner_credentials (
        username VARCHAR(50) PRIMARY KEY, password_hash VARCHAR(255)
      );
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY, name VARCHAR(100), te VARCHAR(100),
        emoji VARCHAR(10), cat VARCHAR(50), unit VARCHAR(20),
        price DECIMAL(10,2), wholesale_price DECIMAL(10,2),
        bulk_available BOOLEAN DEFAULT false, in_stock BOOLEAN DEFAULT true,
        image TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(50) PRIMARY KEY, customer_name VARCHAR(100),
        phone VARCHAR(20), town VARCHAR(50), area VARCHAR(100),
        slot VARCHAR(50), payment VARCHAR(20), notes TEXT,
        subtotal DECIMAL(10,2), delivery_fee DECIMAL(10,2),
        discount DECIMAL(10,2) DEFAULT 0, total DECIMAL(10,2),
        status VARCHAR(20) DEFAULT 'pending',
        placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
      CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(phone);
      CREATE INDEX IF NOT EXISTS idx_orders_placed_at ON orders(placed_at);
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
        name VARCHAR(100), te VARCHAR(100), qty DECIMAL(10,2),
        mode VARCHAR(20), price DECIMAL(10,2)
      );
      CREATE TABLE IF NOT EXISTS coupons (
        id SERIAL PRIMARY KEY, code VARCHAR(50) UNIQUE NOT NULL,
        discount_type VARCHAR(20) NOT NULL, discount_value DECIMAL(10,2) NOT NULL,
        min_order DECIMAL(10,2) DEFAULT 0, max_uses INTEGER DEFAULT NULL,
        uses INTEGER DEFAULT 0, expires_at TIMESTAMP DEFAULT NULL,
        active BOOLEAN DEFAULT true, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        comment TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(product_id, user_id)
      );
    `);

    // ── Safe column migrations for existing DBs ───────────────────────────────
    const migrations = [
      `ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT`,
      `ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount DECIMAL(10,2) DEFAULT 0`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS search_vector tsvector`,
      `ALTER TABLE order_items ADD COLUMN IF NOT EXISTS te VARCHAR(100)`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_attempts INTEGER DEFAULT 0`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP DEFAULT NULL`,
      `ALTER TABLE owner_credentials ADD COLUMN IF NOT EXISTS failed_attempts INTEGER DEFAULT 0`,
      `ALTER TABLE owner_credentials ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP DEFAULT NULL`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_qty INTEGER DEFAULT 100`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 10`,
      `CREATE TABLE IF NOT EXISTS password_resets (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(20) NOT NULL,
        code_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE INDEX IF NOT EXISTS idx_password_resets_phone ON password_resets(phone)`,
      `CREATE TABLE IF NOT EXISTS push_subscriptions (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(20) NOT NULL,
        endpoint TEXT UNIQUE NOT NULL,
        subscription JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE INDEX IF NOT EXISTS idx_push_subscriptions_phone ON push_subscriptions(phone)`,
      `CREATE TABLE IF NOT EXISTS favorites (
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, product_id)
      )`,
      `CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        action VARCHAR(50),
        entity_id VARCHAR(50),
        details JSONB,
        owner_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS customer_notes TEXT`,
      `ALTER TABLE orders ADD COLUMN IF NOT EXISTS issue_reported BOOLEAN DEFAULT false`,
      `ALTER TABLE orders ADD COLUMN IF NOT EXISTS issue_note TEXT`,
      `ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_slot VARCHAR(50)`,
      `ALTER TABLE orders ADD COLUMN IF NOT EXISTS duplicate_warning BOOLEAN DEFAULT false`,
      `ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_rating INTEGER DEFAULT NULL`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS base_stock INTEGER DEFAULT 100`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
    ];
    for (const sql of migrations) {
      await client.query(sql).catch(e => console.warn('Migration skipped:', e.message));
    }

    // Full-text search index on products
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_products_search ON products USING GIN(search_vector);
    `).catch(() => {});

    // Update existing rows' search vectors
    await client.query(`
      UPDATE products SET search_vector = to_tsvector('english', COALESCE(name,'') || ' ' || COALESCE(te,''))
      WHERE search_vector IS NULL;
    `).catch(() => {});

    // Trigger to keep search_vector updated
    await client.query(`
      CREATE OR REPLACE FUNCTION products_search_trigger() RETURNS trigger AS $$
      BEGIN
        NEW.search_vector := to_tsvector('english', COALESCE(NEW.name,'') || ' ' || COALESCE(NEW.te,''));
        RETURN NEW;
      END $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS products_search_update ON products;
      CREATE TRIGGER products_search_update
        BEFORE INSERT OR UPDATE ON products
        FOR EACH ROW EXECUTE FUNCTION products_search_trigger();
    `).catch(() => {});


    // Seed owner
    const ownerCheck = await client.query('SELECT username FROM owner_credentials LIMIT 1');
    if (ownerCheck.rowCount === 0) {
      const hash = await bcrypt.hash('admin123', 10);
      await client.query('INSERT INTO owner_credentials (username, password_hash) VALUES ($1, $2)', ['admin', hash]);
      console.log('Seeded default owner: admin/admin123');
    }

    // Seed products
    const pCheck = await client.query('SELECT id FROM products LIMIT 1');
    if (pCheck.rowCount === 0) {
      console.log('Seeding products...');
      const seeds = [
        { name:'Tomato',te:'టమాటా',emoji:'🍅',cat:'Daily Veg',unit:'kg',price:30,w:20,bulk:true,img:'/images/tomato_1783693568358.png' },
        { name:'Potato',te:'బంగాళదుంప',emoji:'🥔',cat:'Daily Veg',unit:'kg',price:40,w:25,bulk:true,img:'/images/potato_1783693556029.png' },
        { name:'Onion',te:'ఉల్లిపాయ',emoji:'🧅',cat:'Daily Veg',unit:'kg',price:35,w:25,bulk:true,img:'/images/onion_1783693545934.png' },
        { name:'Green Chillies',te:'పచ్చి మిర్చి',emoji:'🌶️',cat:'Daily Veg',unit:'kg',price:60,w:50,bulk:true,img:'/images/green_chillies_1783693739070.png' },
        { name:'Carrot',te:'క్యారెట్',emoji:'🥕',cat:'Daily Veg',unit:'kg',price:50,w:35,bulk:true,img:'/images/carrot_1783693603450.png' },
        { name:'Cucumber',te:'దోసకాయ',emoji:'🥒',cat:'Gourds',unit:'kg',price:40,w:30,bulk:true,img:'/images/cucumber_1783693669259.png' },
        { name:'Bottle Gourd',te:'సొరకాయ',emoji:'🥒',cat:'Gourds',unit:'piece',price:20,w:null,bulk:false,img:'/images/bottle_gourd_1783693706956.png' },
        { name:'Ridge Gourd',te:'బీరకాయ',emoji:'🥒',cat:'Gourds',unit:'kg',price:60,w:45,bulk:true,img:'/images/ridge_gourd_1783693695256.png' },
        { name:'Bitter Gourd',te:'కాకరకాయ',emoji:'🥒',cat:'Gourds',unit:'kg',price:50,w:40,bulk:true,img:'/images/bitter_gourd_1783693681822.png' },
        { name:'Green Brinjal',te:'పచ్చ వంకాయ',emoji:'🍆',cat:'Daily Veg',unit:'kg',price:40,w:25,bulk:true,img:'/images/green_brinjal_1783693579886.png' },
        { name:'Okra',te:'బెండకాయ',emoji:'🥒',cat:'Daily Veg',unit:'kg',price:45,w:30,bulk:true,img:'/images/okra_1783693590479.png' },
        { name:'Green Beans',te:'బీన్స్',emoji:'🫛',cat:'Daily Veg',unit:'kg',price:80,w:65,bulk:true,img:'/images/green_beans_1783693716685.png' },
        { name:'Cauliflower',te:'క్యాలిఫ్లవర్',emoji:'🥦',cat:'Leafy & Others',unit:'piece',price:40,w:null,bulk:false,img:'/images/cauliflower_1783693645566.png' },
        { name:'Cabbage',te:'క్యాబేజీ',emoji:'🥬',cat:'Leafy & Others',unit:'piece',price:30,w:null,bulk:false,img:'/images/cabbage_1783693634635.png' },
        { name:'Drumstick',te:'ములక్కాడ',emoji:'🥢',cat:'Daily Veg',unit:'bunch',price:25,w:null,bulk:false,img:'/images/drumstick_1783693728016.png' },
        { name:'Radish',te:'ముల్లంగి',emoji:'🥕',cat:'Daily Veg',unit:'kg',price:30,w:20,bulk:true,img:'/images/radish_1783693614459.png' },
        { name:'Beetroot',te:'బీట్రూట్',emoji:'🔴',cat:'Daily Veg',unit:'kg',price:45,w:35,bulk:true,img:'/images/beetroot_1783693624043.png' },
      ];
      for (const p of seeds) {
        await client.query(
          `INSERT INTO products (name,te,emoji,cat,unit,price,wholesale_price,bulk_available,image)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [p.name,p.te,p.emoji,p.cat,p.unit,p.price,p.w,p.bulk,p.img]
        );
      }
      await client.query(`UPDATE products SET search_vector = to_tsvector('english', COALESCE(name,'') || ' ' || COALESCE(te,''))`);
      await client.query(`INSERT INTO coupons (code,discount_type,discount_value,min_order) VALUES ('FRESH10','percent',10,150) ON CONFLICT DO NOTHING`);
    }

    console.log('Database ready.');
  } catch (e) {
    console.error('DB init error:', e);
    throw e;
  } finally {
    client.release();
  }
};

// =============================================================================
// CUSTOMER AUTH
// =============================================================================

app.post('/api/auth/register', loginLimiter,
  [
    body('name').trim().isLength({ min: 2 }),
    body('phone').trim().matches(/^\d{10}$/),
    body('password').isStrongPassword(),
  ], validate,
  async (req, res) => {
    const { name, phone, password } = req.body;
    try {
      const exists = await pool.query('SELECT id FROM users WHERE phone=$1', [phone]);
      if (exists.rowCount > 0) return res.status(409).json({ error: 'Phone already registered' });
      const hash = await bcrypt.hash(password, 10);
      const { rows } = await pool.query(
        'INSERT INTO users(name,phone,password_hash,role) VALUES($1,$2,$3,$4) RETURNING id,name,phone,role',
        [name, phone, hash, 'customer']
      );
      const user = rows[0];
      const token = jwt.sign({ id: user.id, phone: user.phone, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '15m' });
      const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: '30d' });
      const rtHash = await bcrypt.hash(refreshToken, 8);
      const exp = new Date(Date.now() + 30 * 24 * 3600 * 1000);
      await pool.query('INSERT INTO refresh_tokens(user_id,token_hash,expires_at) VALUES($1,$2,$3)', [user.id, rtHash, exp]);
      res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
      res.status(201).json({ user, token });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Registration failed' }); }
  }
);

app.post('/api/auth/login', loginLimiter,
  [body('phone').trim().matches(/^\d{10}$/), body('password').notEmpty()], validate,
  async (req, res) => {
    const { phone, password } = req.body;
    try {
      const { rows } = await pool.query('SELECT * FROM users WHERE phone=$1', [phone]);
      if (!rows.length) return res.status(401).json({ error: 'Invalid phone or password' });
      const user = rows[0];

      if (user.locked_until && new Date(user.locked_until) > new Date()) {
        const minsLeft = Math.ceil((new Date(user.locked_until) - new Date()) / 60000);
        return res.status(423).json({ error: `Too many failed attempts. Try again in ${minsLeft} minute${minsLeft === 1 ? '' : 's'}.` });
      }

      const passwordOk = await bcrypt.compare(password, user.password_hash);
      if (!passwordOk) {
        const attempts = (user.failed_attempts || 0) + 1;
        const lockedUntil = attempts >= MAX_FAILED_ATTEMPTS ? new Date(Date.now() + LOCKOUT_MS) : null;
        await pool.query('UPDATE users SET failed_attempts=$1, locked_until=$2 WHERE id=$3', [attempts, lockedUntil, user.id]);
        if (lockedUntil) {
          return res.status(423).json({ error: `Too many failed attempts. Account locked for ${LOCKOUT_MS / 60000} minutes.` });
        }
        return res.status(401).json({ error: 'Invalid phone or password' });
      }

      await pool.query('UPDATE users SET failed_attempts=0, locked_until=NULL WHERE id=$1', [user.id]);
      const token = jwt.sign({ id: user.id, phone: user.phone, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '15m' });
      const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: '30d' });
      const rtHash = await bcrypt.hash(refreshToken, 8);
      const exp = new Date(Date.now() + 30 * 24 * 3600 * 1000);
      await pool.query('DELETE FROM refresh_tokens WHERE user_id=$1', [user.id]);
      await pool.query('INSERT INTO refresh_tokens(user_id,token_hash,expires_at) VALUES($1,$2,$3)', [user.id, rtHash, exp]);
      res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
      res.json({ user: { id: user.id, name: user.name, phone: user.phone, role: user.role }, token });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Login failed' }); }
  }
);

// ─── Forgot / reset password (demo-mode: no SMS gateway, code is returned) ────
app.post('/api/auth/forgot-password', loginLimiter,
  [body('phone').trim().matches(/^\d{10}$/)], validate,
  async (req, res) => {
    const { phone } = req.body;
    try {
      const { rows } = await pool.query('SELECT id FROM users WHERE phone=$1', [phone]);
      // Always respond the same way whether or not the phone exists, so the
      // endpoint can't be used to enumerate registered numbers.
      if (!rows.length) return res.json({ message: 'If that number is registered, a reset code has been sent.' });

      const code = String(Math.floor(1000 + Math.random() * 9000));
      const codeHash = await bcrypt.hash(code, 8);
      const expiresAt = new Date(Date.now() + RESET_CODE_TTL_MS);
      await pool.query('INSERT INTO password_resets(phone, code_hash, expires_at) VALUES($1,$2,$3)', [phone, codeHash, expiresAt]);

      // No SMS gateway is configured in this demo — return the code directly
      // so the flow is testable end-to-end. Swap this for a real SMS send in
      // production and drop `devCode` from the response.
      res.json({ message: 'Reset code generated.', devCode: code });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Could not start password reset' }); }
  }
);

app.post('/api/auth/reset-password', loginLimiter,
  [
    body('phone').trim().matches(/^\d{10}$/),
    body('code').trim().matches(/^\d{4}$/),
    body('newPassword').isStrongPassword(),
  ], validate,
  async (req, res) => {
    const { phone, code, newPassword } = req.body;
    try {
      const { rows } = await pool.query(
        `SELECT * FROM password_resets WHERE phone=$1 AND used=false AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1`,
        [phone]
      );
      if (!rows.length) return res.status(400).json({ error: 'That code has expired. Please request a new one.' });

      const reset = rows[0];
      const codeOk = await bcrypt.compare(code, reset.code_hash);
      if (!codeOk) return res.status(400).json({ error: "That code doesn't match. Please try again." });

      const { rows: userRows } = await pool.query('SELECT id FROM users WHERE phone=$1', [phone]);
      if (!userRows.length) return res.status(404).json({ error: 'No account found for that number.' });

      const hash = await bcrypt.hash(newPassword, 10);
      await pool.query('UPDATE users SET password_hash=$1, failed_attempts=0, locked_until=NULL WHERE id=$2', [hash, userRows[0].id]);
      await pool.query('UPDATE password_resets SET used=true WHERE id=$1', [reset.id]);
      // A password reset also invalidates any existing sessions for safety.
      await pool.query('DELETE FROM refresh_tokens WHERE user_id=$1', [userRows[0].id]);

      res.json({ message: 'Password updated. Please sign in.' });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Could not reset password' }); }
  }
);

app.post('/api/auth/refresh', async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) return res.sendStatus(401);
  try {
    const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const { rows } = await pool.query(
      'SELECT rt.*, u.name, u.phone, u.role FROM refresh_tokens rt JOIN users u ON rt.user_id=u.id WHERE rt.user_id=$1 AND rt.expires_at > NOW()',
      [payload.id]
    );
    if (!rows.length) return res.sendStatus(403);
    const stored = rows[0];
    const valid = await bcrypt.compare(refreshToken, stored.token_hash);
    if (!valid) return res.sendStatus(403);
    const token = jwt.sign({ id: payload.id, phone: stored.phone, role: stored.role, name: stored.name }, JWT_SECRET, { expiresIn: '15m' });
    res.json({ token });
  } catch (e) { return res.sendStatus(403); }
});

app.post('/api/auth/logout', async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken) {
    try {
      const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
      await pool.query('DELETE FROM refresh_tokens WHERE user_id=$1', [payload.id]);
    } catch {}
  }
  res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);
  res.json({ message: 'Logged out' });
});

app.get('/api/auth/me', authenticateToken, (req, res) => res.json({ user: req.user }));

// =============================================================================
// OWNER AUTH
// =============================================================================

app.post('/api/owner/login', loginLimiter,
  [body('username').trim().notEmpty(), body('password').notEmpty()], validate,
  async (req, res) => {
    const { username, password } = req.body;
    try {
      const { rows } = await pool.query('SELECT * FROM owner_credentials WHERE username=$1', [username]);
      if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
      const owner = rows[0];

      if (owner.locked_until && new Date(owner.locked_until) > new Date()) {
        const minsLeft = Math.ceil((new Date(owner.locked_until) - new Date()) / 60000);
        return res.status(423).json({ error: `Too many failed attempts. Try again in ${minsLeft} minute${minsLeft === 1 ? '' : 's'}.` });
      }

      const passwordOk = await bcrypt.compare(password, owner.password_hash);
      if (!passwordOk) {
        const attempts = (owner.failed_attempts || 0) + 1;
        const lockedUntil = attempts >= MAX_FAILED_ATTEMPTS ? new Date(Date.now() + LOCKOUT_MS) : null;
        await pool.query('UPDATE owner_credentials SET failed_attempts=$1, locked_until=$2 WHERE username=$3', [attempts, lockedUntil, username]);
        if (lockedUntil) {
          return res.status(423).json({ error: `Too many failed attempts. Account locked for ${LOCKOUT_MS / 60000} minutes.` });
        }
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      await pool.query('UPDATE owner_credentials SET failed_attempts=0, locked_until=NULL WHERE username=$1', [username]);
      const token = jwt.sign({ username: owner.username, role: 'owner' }, JWT_SECRET, { expiresIn: '12h' });
      res.json({ token });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Login failed' }); }
  }
);

app.patch('/api/owner/password', authenticateOwner,
  [body('currentPassword').notEmpty(), body('newPassword').isStrongPassword()], validate,
  async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
      const { rows } = await pool.query('SELECT * FROM owner_credentials WHERE username=$1', [req.user.username]);
      if (!rows.length || !(await bcrypt.compare(currentPassword, rows[0].password_hash)))
        return res.status(401).json({ error: 'Current password incorrect' });
      const hash = await bcrypt.hash(newPassword, 10);
      await pool.query('UPDATE owner_credentials SET password_hash=$1 WHERE username=$2', [hash, req.user.username]);
      res.json({ message: 'Password updated' });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Failed' }); }
  }
);

// =============================================================================
// PRODUCTS
// =============================================================================

app.get('/api/products', async (req, res) => {
  const { search, cat, limit = 100, offset = 0 } = req.query;
  const cacheKey = `products:${search||''}:${cat||''}:${limit}:${offset}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return res.json(cached);

  let q = 'SELECT p.*, ROUND(AVG(r.rating),1) as avg_rating, COUNT(r.id) as review_count FROM products p LEFT JOIN reviews r ON p.id=r.product_id WHERE 1=1';
  const params = [];

  if (search) {
    params.push(search);
    q += ` AND (p.search_vector @@ plainto_tsquery('english', $${params.length}) OR p.name ILIKE $${params.length+1} OR p.te ILIKE $${params.length+1})`;
    params.push(`%${search}%`);
  }
  if (cat && cat !== 'All') { params.push(cat); q += ` AND p.cat=$${params.length}`; }
  params.push(parseInt(limit), parseInt(offset));
  q += ` GROUP BY p.id ORDER BY p.id ASC LIMIT $${params.length-1} OFFSET $${params.length}`;

  try {
    const { rows } = await pool.query(q, params);
    const result = rows.map(r => ({
      id: r.id, name: r.name, te: r.te, emoji: r.emoji, cat: r.cat, unit: r.unit,
      bulkAvailable: r.bulk_available, inStock: r.in_stock, stockQty: r.stock_qty, lowStockThreshold: r.low_stock_threshold,
      wholesalePrice: r.wholesale_price ? parseFloat(r.wholesale_price) : undefined,
      price: parseFloat(r.price), image: r.image,
      avgRating: r.avg_rating ? parseFloat(r.avg_rating) : 0,
      reviewCount: parseInt(r.review_count || 0),
      updatedAt: r.updated_at,
    }));
    await cacheSet(cacheKey, result, 300);
    res.json(result);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to fetch products' }); }
});

app.post('/api/products', authenticateOwner,
  [body('name').trim().notEmpty(), body('price').isFloat({ gt: 0 }), body('unit').notEmpty()], validate,
  async (req, res) => {
    const { name, te, emoji, cat, unit, price, wholesalePrice, bulkAvailable, inStock, image, stockQty, lowStockThreshold } = req.body;
    try {
      const { rows } = await pool.query(
        `INSERT INTO products(name,te,emoji,cat,unit,price,wholesale_price,bulk_available,in_stock,image,stock_qty,low_stock_threshold)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
        [name, te, emoji, cat, unit, price, wholesalePrice||null, bulkAvailable, inStock??true, image||null, stockQty||100, lowStockThreshold||10]
      );
      await cacheDel(...(await redis?.keys('products:*') || []));
      res.status(201).json(rows[0]);
    } catch (e) { console.error(e); res.status(500).json({ error: 'Failed' }); }
  }
);

app.put('/api/products/:id', authenticateOwner,
  [param('id').isInt()], validate,
  async (req, res) => {
    const { name, te, emoji, cat, unit, price, wholesalePrice, bulkAvailable, inStock, image, stockQty, lowStockThreshold } = req.body;
    try {
      const { rows: oldRows } = await pool.query('SELECT price, name FROM products WHERE id=$1', [req.params.id]);
      const oldProduct = oldRows[0];

      await pool.query(
        `UPDATE products SET name=COALESCE($1,name),te=COALESCE($2,te),emoji=COALESCE($3,emoji),
         cat=COALESCE($4,cat),unit=COALESCE($5,unit),price=COALESCE($6,price),
         wholesale_price=COALESCE($7,wholesale_price),bulk_available=COALESCE($8,bulk_available),
         in_stock=COALESCE($9,in_stock),image=COALESCE($10,image),stock_qty=COALESCE($11,stock_qty),
         low_stock_threshold=COALESCE($12,low_stock_threshold), updated_at=CURRENT_TIMESTAMP WHERE id=$13`,
        [name,te,emoji,cat,unit,price,wholesalePrice,bulkAvailable,inStock,image,stockQty,lowStockThreshold,req.params.id]
      );
      
      // Audit log
      await pool.query(
        `INSERT INTO audit_logs (action, entity_id, details) VALUES ($1, $2, $3)`,
        ['UPDATE_PRODUCT', req.params.id, JSON.stringify({ oldPrice: oldProduct?.price, newPrice: price, stockQty })]
      );

      // Price drop alert
      if (oldProduct && price !== undefined && Number(price) < Number(oldProduct.price)) {
        if (typeof PUSH_ENABLED !== 'undefined' && PUSH_ENABLED) {
          const { rows: subs } = await pool.query(`
            SELECT ps.subscription FROM push_subscriptions ps
            JOIN users u ON ps.phone = u.phone
            JOIN favorites f ON u.id = f.user_id
            WHERE f.product_id = $1
          `, [req.params.id]);
          const payload = { title: 'Price Drop Alert! 📉', body: `${oldProduct.name} is now just ₹${price}! Tap to grab it.` };
          subs.forEach(row => {
            webpush.sendNotification(row.subscription, JSON.stringify(payload)).catch(() => {});
          });
        }
      }

      await cacheDel(...(await redis?.keys('products:*') || []));
      res.json({ message: 'Updated' });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Failed' }); }
  }
);

app.delete('/api/products/:id', authenticateOwner, [param('id').isInt()], validate,
  async (req, res) => {
    await pool.query('DELETE FROM products WHERE id=$1', [req.params.id]);
    await cacheDel(...(await redis?.keys('products:*') || []));
    res.json({ message: 'Deleted' });
  }
);

// Image upload
app.post('/api/products/:id/image', authenticateOwner, [param('id').isInt()], validate,
  upload.single('image'),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
    try {
      const webpBuffer = await sharp(req.file.buffer).webp({ quality: 80 }).toBuffer();
      const bucket = process.env.S3_BUCKET || 'vr-vegetables';
      const key = `products/product-${req.params.id}-${Date.now()}.webp`;
      await s3Client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: webpBuffer,
        ContentType: 'image/webp',
        ACL: 'public-read'
      }));
      // For minio locally, format is /bucket/key. Adjust if using actual AWS S3.
      const imageUrl = `/${bucket}/${key}`;
      await pool.query('UPDATE products SET image=$1 WHERE id=$2', [imageUrl, req.params.id]);
      await cacheDel(...(await redis?.keys('products:*') || []));
      res.json({ image: imageUrl });
    } catch(e) {
      console.error("Image upload failed:", e);
      res.status(500).json({ error: 'Failed to upload image' });
    }
  }
);

// =============================================================================
// REVIEWS
// =============================================================================

app.get('/api/products/:id/reviews', [param('id').isInt()], validate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.id,r.rating,r.comment,r.created_at,u.name as user_name
       FROM reviews r JOIN users u ON r.user_id=u.id
       WHERE r.product_id=$1 ORDER BY r.created_at DESC LIMIT 20`,
      [req.params.id]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

app.post('/api/products/:id/reviews', authenticateToken,
  [param('id').isInt(), body('rating').isInt({ min:1, max:5 })], validate,
  async (req, res) => {
    const { rating, comment } = req.body;
    try {
      const { rows } = await pool.query(
        `INSERT INTO reviews(product_id,user_id,rating,comment) VALUES($1,$2,$3,$4)
         ON CONFLICT(product_id,user_id) DO UPDATE SET rating=$3,comment=$4,created_at=NOW() RETURNING *`,
        [req.params.id, req.user.id, rating, comment||null]
      );
      await cacheDel(...(await redis?.keys('products:*') || []));
      res.status(201).json(rows[0]);
    } catch (e) { console.error(e); res.status(500).json({ error: 'Failed' }); }
  }
);

// =============================================================================
// COUPONS
// =============================================================================

app.post('/api/coupons/validate', publicWriteLimiter,
  [body('code').trim().notEmpty(), body('orderTotal').isFloat({ gt:0 })], validate,
  async (req, res) => {
    const { code, orderTotal } = req.body;
    const cacheKey = `coupon:${code.toUpperCase()}`;
    let coupon = await cacheGet(cacheKey);
    if (!coupon) {
      const { rows } = await pool.query(`SELECT * FROM coupons WHERE UPPER(code)=UPPER($1) AND active=true`, [code]);
      if (!rows.length) return res.status(404).json({ error: 'Invalid coupon code' });
      coupon = rows[0];
      await cacheSet(cacheKey, coupon, 30);
    }
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) return res.status(400).json({ error: 'Coupon expired' });
    if (coupon.max_uses !== null && coupon.uses >= coupon.max_uses) return res.status(400).json({ error: 'Coupon usage limit reached' });
    if (orderTotal < parseFloat(coupon.min_order)) return res.status(400).json({ error: `Minimum order ₹${coupon.min_order} required` });
    const discount = coupon.discount_type === 'percent'
      ? Math.round(orderTotal * parseFloat(coupon.discount_value) / 100)
      : Math.min(parseFloat(coupon.discount_value), orderTotal);
    res.json({ valid: true, discount, discountType: coupon.discount_type, discountValue: parseFloat(coupon.discount_value), couponId: coupon.id });
  }
);

app.get('/api/coupons', authenticateOwner, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM coupons ORDER BY created_at DESC');
  res.json(rows);
});

app.post('/api/coupons', authenticateOwner,
  [body('code').trim().notEmpty(), body('discountType').isIn(['percent','flat']), body('discountValue').isFloat({ gt:0 })], validate,
  async (req, res) => {
    const { code, discountType, discountValue, minOrder, maxUses, expiresAt } = req.body;
    try {
      const { rows } = await pool.query(
        `INSERT INTO coupons(code,discount_type,discount_value,min_order,max_uses,expires_at)
         VALUES(UPPER($1),$2,$3,$4,$5,$6) RETURNING *`,
        [code, discountType, discountValue, minOrder||0, maxUses||null, expiresAt||null]
      );
      res.status(201).json(rows[0]);
    } catch (e) {
      if (e.code==='23505') return res.status(409).json({ error: 'Code already exists' });
      res.status(500).json({ error: 'Failed' });
    }
  }
);

app.delete('/api/coupons/:id', authenticateOwner, [param('id').isInt()], validate, async (req, res) => {
  await pool.query('DELETE FROM coupons WHERE id=$1', [req.params.id]);
  res.json({ message: 'Deleted' });
});

// =============================================================================
// PUSH NOTIFICATIONS (order status updates)
// =============================================================================

app.get('/api/push/vapid-public-key', (req, res) => {
  if (!PUSH_ENABLED) return res.status(501).json({ error: 'Push notifications are not configured' });
  res.json({ publicKey: VAPID_PUBLIC_KEY });
});

app.post('/api/push/subscribe', authenticateToken,
  [body('subscription').isObject(), body('subscription.endpoint').isURL()], validate,
  async (req, res) => {
    if (!PUSH_ENABLED) return res.status(501).json({ error: 'Push notifications are not configured' });
    try {
      await pool.query(
        `INSERT INTO push_subscriptions (phone, endpoint, subscription) VALUES ($1,$2,$3)
         ON CONFLICT (endpoint) DO UPDATE SET phone=$1, subscription=$3`,
        [req.user.phone, req.body.subscription.endpoint, req.body.subscription]
      );
      res.status(201).json({ message: 'Subscribed' });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to subscribe' }); }
  }
);

app.post('/api/push/unsubscribe', authenticateToken,
  [body('endpoint').isURL()], validate,
  async (req, res) => {
    try {
      await pool.query('DELETE FROM push_subscriptions WHERE endpoint=$1 AND phone=$2', [req.body.endpoint, req.user.phone]);
      res.json({ message: 'Unsubscribed' });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to unsubscribe' }); }
  }
);

// =============================================================================
// ORDERS
// =============================================================================

app.post('/api/orders', publicWriteLimiter,
  [
    body('id').trim().notEmpty(),
    body('customerName').trim().notEmpty(),
    body('phone').trim().matches(/^\d{10}$/),
    body('items').isArray({ min:1 }),
    body('total').isFloat({ gt:0 }),
  ], validate,
  async (req, res) => {
    const { id, customerName, phone, town, area, slot, payment, notes, subtotal, deliveryFee, discount, total, items, placedAt, couponId } = req.body;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Duplicate detection
      const { rows: dupCheck } = await client.query(
        `SELECT id FROM orders WHERE phone=$1 AND placed_at > NOW() - INTERVAL '5 minutes'`, 
        [phone]
      );
      const isDuplicate = dupCheck.length > 0;

      await client.query(
        `INSERT INTO orders(id,customer_name,phone,town,area,slot,payment,notes,subtotal,delivery_fee,discount,total,placed_at,duplicate_warning)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
        [id, customerName, phone, town, area, slot, payment, notes||null, subtotal, deliveryFee, discount||0, total, placedAt||new Date(), isDuplicate]
      );
      for (const item of items) {
        await client.query(
          `INSERT INTO order_items(order_id,name,te,qty,mode,price) VALUES($1,$2,$3,$4,$5,$6)`,
          [id, item.name, item.te, item.qty, item.mode, item.price]
        );
      }
      if (couponId) await client.query('UPDATE coupons SET uses=uses+1 WHERE id=$1', [couponId]);
      await client.query('COMMIT');

      // Update stock and check thresholds asynchronously
      (async () => {
        try {
          for (const item of items) {
            const { rows } = await pool.query('UPDATE products SET stock_qty = stock_qty - $1 WHERE name = $2 RETURNING id, name, stock_qty, low_stock_threshold', [item.qty, item.name]);
            if (rows.length > 0) {
              const p = rows[0];
              if (p.stock_qty <= p.low_stock_threshold) {
                // Send push notification to owner
                const { rows: owners } = await pool.query("SELECT phone FROM push_subscriptions WHERE phone IN (SELECT phone FROM users WHERE role='owner')");
                if (owners.length > 0) {
                   for (const o of owners) {
                      await sendPushToPhone(o.phone, { title: 'Low Stock Alert', body: `${p.name} is running low! Only ${p.stock_qty} left.` });
                   }
                }
              }
            }
          }
        } catch(e) { console.error('Stock decrement failed:', e); }
      })();

      // Notify owner via Socket.IO
      io.to('owner').emit('new_order', { id, customerName, phone, total, status: 'pending' });
      await cacheDel('stats:main', 'stats:daily');

      res.status(201).json({ message: 'Order placed', id });
    } catch (e) {
      await client.query('ROLLBACK');
      console.error(e);
      res.status(500).json({ error: 'Failed to place order' });
    } finally { client.release(); }
  }
);

app.get('/api/orders', authenticateOwner, async (req, res) => {
  const { search, status, limit=100, offset=0 } = req.query;
  let where = 'WHERE 1=1'; const params = [];
  if (status && status !== 'all') { params.push(status); where += ` AND o.status=$${params.length}`; }
  if (search) {
    params.push(`%${search}%`); const idx = params.length;
    where += ` AND (o.customer_name ILIKE $${idx} OR o.phone ILIKE $${idx} OR o.id ILIKE $${idx})`;
  }
  params.push(parseInt(limit), parseInt(offset));
  try {
    const { rows } = await pool.query(
      `SELECT o.id,o.customer_name,o.phone,o.town,o.area,o.slot,o.payment,o.notes,
              o.subtotal,o.delivery_fee,o.discount,o.total,o.status,o.placed_at,
              o.duplicate_warning,o.issue_reported,o.issue_note,o.delivery_rating,
              u.customer_notes,
              COALESCE(json_agg(json_build_object('name',oi.name,'te',oi.te,'qty',oi.qty::float,'mode',oi.mode,'price',oi.price::float))
                FILTER(WHERE oi.id IS NOT NULL),'[]') as items
       FROM orders o 
       LEFT JOIN order_items oi ON o.id=oi.order_id
       LEFT JOIN users u ON o.phone=u.phone
       ${where} GROUP BY o.id, u.customer_notes ORDER BY o.placed_at DESC
       LIMIT $${params.length-1} OFFSET $${params.length}`,
      params
    );
    res.json(rows.map(o => ({
      id:o.id, customerName:o.customer_name, phone:o.phone, town:o.town, area:o.area,
      slot:o.slot, payment:o.payment, notes:o.notes,
      subtotal:parseFloat(o.subtotal), deliveryFee:parseFloat(o.delivery_fee),
      discount:parseFloat(o.discount||0), total:parseFloat(o.total),
      status:o.status, placedAt:o.placed_at, items:o.items,
      duplicateWarning:o.duplicate_warning, issueReported:o.issue_reported,
      issueNote:o.issue_note, deliveryRating:o.delivery_rating,
      customerNotes:o.customer_notes
    })));
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed' }); }
});

// CSV export
app.get('/api/orders/export', authenticateOwner, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT o.id,o.customer_name,o.phone,o.town,o.area,o.slot,o.payment,
            o.subtotal,o.delivery_fee,o.discount,o.total,o.status,o.placed_at,
            STRING_AGG(oi.name||' x'||oi.qty,', ') as items
     FROM orders o LEFT JOIN order_items oi ON o.id=oi.order_id
     GROUP BY o.id ORDER BY o.placed_at DESC`
  );
  const parser = new Parser({ fields:['id','customer_name','phone','town','area','slot','payment','subtotal','delivery_fee','discount','total','status','placed_at','items'] });
  res.setHeader('Content-Type','text/csv');
  res.setHeader('Content-Disposition','attachment; filename=orders.csv');
  res.send(parser.parse(rows));
});

// PDF Invoice
app.get('/api/orders/:id/invoice', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT o.*,COALESCE(json_agg(json_build_object('name',oi.name,'qty',oi.qty::float,'price',oi.price::float,'mode',oi.mode))
        FILTER(WHERE oi.id IS NOT NULL),'[]') as items
       FROM orders o LEFT JOIN order_items oi ON o.id=oi.order_id WHERE o.id=$1 GROUP BY o.id`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Order not found' });
    const o = rows[0];
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type','application/pdf');
    res.setHeader('Content-Disposition',`attachment; filename=invoice-${o.id}.pdf`);
    doc.pipe(res);

    // Header
    doc.fontSize(22).fillColor('#16a34a').text('VR Venkataramana Vegetables', { align: 'center' });
    doc.fontSize(10).fillColor('#64748b').text('Fresh veggies from farm to your kitchen', { align: 'center' });
    doc.moveDown();
    doc.moveTo(50,doc.y).lineTo(545,doc.y).stroke('#e2e8f0');
    doc.moveDown(0.5);

    // Order info
    doc.fillColor('#0f172a').fontSize(12).text(`Invoice: ${o.id}`, 50);
    doc.fontSize(10).fillColor('#64748b').text(`Date: ${new Date(o.placed_at).toLocaleDateString('en-IN',{dateStyle:'long'})}`);
    doc.text(`Customer: ${o.customer_name} | Phone: ${o.phone}`);
    doc.text(`Delivery: ${o.area}, ${o.town}`);
    doc.text(`Slot: ${o.slot} | Payment: ${o.payment?.toUpperCase()}`);
    doc.moveDown();

    // Items table
    doc.fillColor('#16a34a').fontSize(11).text('Items', 50);
    doc.moveDown(0.3);
    doc.moveTo(50,doc.y).lineTo(545,doc.y).stroke('#bbf7d0');
    doc.moveDown(0.3);
    for (const item of o.items) {
      const lineTotal = (item.price * item.qty).toFixed(2);
      doc.fillColor('#0f172a').fontSize(10)
        .text(`${item.name}`, 50, doc.y, { continued: true, width: 260 })
        .text(`${item.qty} × ₹${item.price}`, { continued: true, width: 150 })
        .text(`₹${lineTotal}`, { align: 'right' });
    }
    doc.moveDown(0.3).moveTo(50,doc.y).lineTo(545,doc.y).stroke('#e2e8f0').moveDown(0.5);

    // Totals
    const totals = [
      ['Subtotal', `₹${parseFloat(o.subtotal).toFixed(2)}`],
      ['Delivery Fee', parseFloat(o.delivery_fee) === 0 ? 'FREE' : `₹${parseFloat(o.delivery_fee).toFixed(2)}`],
    ];
    if (parseFloat(o.discount||0) > 0) totals.push(['Discount', `-₹${parseFloat(o.discount).toFixed(2)}`]);
    totals.push(['TOTAL', `₹${parseFloat(o.total).toFixed(2)}`]);
    for (const [label, val] of totals) {
      const bold = label === 'TOTAL';
      doc.fillColor(bold ? '#16a34a' : '#0f172a').fontSize(bold ? 12 : 10)
        .text(label, 350, doc.y, { continued: true, width: 100 })
        .text(val, { align: 'right', width: 95 });
    }
    doc.moveDown(2).fillColor('#94a3b8').fontSize(9).text('Thank you for shopping with VR Venkataramana Vegetables!', { align: 'center' });
    doc.end();
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to generate invoice' }); }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT o.id,o.status,o.placed_at,o.customer_name,o.phone,o.town,o.area,o.total,o.notes,
              COALESCE(json_agg(json_build_object('name',oi.name,'qty',oi.qty::float,'price',oi.price::float))
                FILTER(WHERE oi.id IS NOT NULL),'[]') as items
       FROM orders o LEFT JOIN order_items oi ON o.id=oi.order_id WHERE o.id=$1 GROUP BY o.id`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

app.patch('/api/orders/:id/status', authenticateOwner,
  [param('id').notEmpty(), body('status').isIn(['pending','processing','out_for_delivery','delivered','cancelled'])], validate,
  async (req, res) => {
    const { status } = req.body;
    try {
      const { rows, rowCount } = await pool.query(
        'UPDATE orders SET status=$1 WHERE id=$2 RETURNING phone', [status, req.params.id]
      );
      if (!rowCount) return res.status(404).json({ error: 'Not found' });

      // Emit real-time update to customer tracking page and owner
      io.to(`order:${req.params.id}`).emit('status_change', { orderId: req.params.id, status });
      io.to('owner').emit('order_updated', { orderId: req.params.id, status });
      await cacheDel('stats:main', 'stats:daily');

      // Audit log
      await pool.query(
        `INSERT INTO audit_logs (action, entity_id, details) VALUES ($1, $2, $3)`,
        ['ORDER_STATUS', req.params.id, JSON.stringify({ status })]
      );

      const statusMessages = {
        pending: 'Your order has been received.',
        processing: 'Your order is being packed.',
        out_for_delivery: 'Your order is out for delivery!',
        delivered: 'Your order has been delivered. Enjoy!',
        cancelled: 'Your order was cancelled.',
      };
      sendPushToPhone(rows[0].phone, {
        title: 'VR Vegetables',
        body: statusMessages[status] || `Order status: ${status}`,
        orderId: req.params.id,
      }); // fire-and-forget

      res.json({ message: 'Status updated' });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Failed' }); }
  }
);

// --- New Owner Endpoints ---
app.post('/api/owner/orders', authenticateOwner, validate, async (req, res) => {
  const { id, customerName, phone, items, subtotal, deliveryFee, total, town, area } = req.body;
  try {
    await pool.query('BEGIN');
    await pool.query(
      `INSERT INTO orders(id,customer_name,phone,subtotal,delivery_fee,total,town,area,placed_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,NOW())`,
      [id, customerName, phone, subtotal, deliveryFee, total, town, area]
    );
    for (const item of items) {
      await pool.query(`INSERT INTO order_items(order_id,name,te,qty,mode,price) VALUES($1,$2,$3,$4,$5,$6)`, [id, item.name, item.te, item.qty, item.mode, item.price]);
    }
    await pool.query('COMMIT');
    res.json({ message: 'Order created' });
  } catch (e) { await pool.query('ROLLBACK'); console.error(e); res.status(500).json({ error: 'Failed' }); }
});

app.get('/api/owner/orders/last/:phone', authenticateOwner, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM orders WHERE phone=$1 ORDER BY placed_at DESC LIMIT 1', [req.params.phone]);
    if (!rows.length) return res.json(null);
    const order = rows[0];
    const { rows: items } = await pool.query('SELECT * FROM order_items WHERE order_id=$1', [order.id]);
    res.json({ ...order, items });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed' }); }
});

app.post('/api/owner/products/restock', authenticateOwner, async (req, res) => {
  try {
    await pool.query('UPDATE products SET stock_qty = base_stock, updated_at = CURRENT_TIMESTAMP');
    await pool.query(`INSERT INTO audit_logs (action, details) VALUES ('RESTOCK_ALL', '{}')`);
    await cacheDel(...(await redis?.keys('products:*') || []));
    res.json({ message: 'Restocked to base quantities' });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed' }); }
});

app.patch('/api/owner/customers/:phone/notes', authenticateOwner, async (req, res) => {
  try {
    await pool.query('UPDATE users SET customer_notes=$1 WHERE phone=$2', [req.body.notes, req.params.phone]);
    res.json({ message: 'Notes updated' });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed' }); }
});

app.patch('/api/owner/orders/:id/issue', authenticateOwner, async (req, res) => {
  try {
    await pool.query('UPDATE orders SET issue_reported=$1, issue_note=$2 WHERE id=$3', [req.body.reported, req.body.note, req.params.id]);
    res.json({ message: 'Issue updated' });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed' }); }
});

app.get('/api/owner/audit_logs', authenticateOwner, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100');
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed' }); }
});

// --- New Customer Endpoints ---
app.patch('/api/orders/:id/rating', async (req, res) => {
  try {
    await pool.query('UPDATE orders SET delivery_rating=$1 WHERE id=$2', [req.body.rating, req.params.id]);
    res.json({ message: 'Rated' });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed' }); }
});

app.get('/api/orders/frequent/:phone', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT oi.name, oi.te, oi.price, oi.mode, SUM(oi.qty) as total_qty
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.phone = $1
      GROUP BY oi.name, oi.te, oi.price, oi.mode
      ORDER BY total_qty DESC
      LIMIT 5
    `, [req.params.phone]);
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed' }); }
});

app.post('/api/favorites/:id', async (req, res) => {
  const { phone } = req.body;
  try {
    const { rows: users } = await pool.query('SELECT id FROM users WHERE phone=$1', [phone]);
    if (!users.length) return res.status(404).json({ error: 'User not found' });
    await pool.query('INSERT INTO favorites (user_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [users[0].id, req.params.id]);
    res.json({ message: 'Favorited' });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed' }); }
});

app.delete('/api/favorites/:id', async (req, res) => {
  const { phone } = req.body;
  try {
    const { rows: users } = await pool.query('SELECT id FROM users WHERE phone=$1', [phone]);
    if (!users.length) return res.status(404).json({ error: 'User not found' });
    await pool.query('DELETE FROM favorites WHERE user_id=$1 AND product_id=$2', [users[0].id, req.params.id]);
    res.json({ message: 'Unfavorited' });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed' }); }
});

app.get('/api/favorites/:phone', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.id FROM favorites f
      JOIN users u ON f.user_id = u.id
      JOIN products p ON f.product_id = p.id
      WHERE u.phone = $1
    `, [req.params.phone]);
    res.json(rows.map(r => r.id));
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed' }); }
});

// =============================================================================
// STATS (with Redis cache)
// =============================================================================

app.get('/api/stats', authenticateOwner, async (req, res) => {
  const cached = await cacheGet('stats:main');
  if (cached) return res.json(cached);

  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const weekStart = new Date(); weekStart.setDate(weekStart.getDate()-7);
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);

    const [todayR, weekR, monthR, topR, outR] = await Promise.all([
      pool.query(`SELECT COUNT(*) orders,COALESCE(SUM(total),0) revenue,
        COUNT(CASE WHEN status IN('pending','processing','out_for_delivery') THEN 1 END) pending
        FROM orders WHERE placed_at>=$1`,[today]),
      pool.query(`SELECT COUNT(*) orders,COALESCE(SUM(total),0) revenue FROM orders WHERE placed_at>=$1`,[weekStart]),
      pool.query(`SELECT COUNT(*) orders,COALESCE(SUM(total),0) revenue FROM orders WHERE placed_at>=$1`,[monthStart]),
      pool.query(`SELECT oi.name,SUM(oi.qty) total_qty,SUM(oi.price*oi.qty) revenue
        FROM order_items oi JOIN orders o ON oi.order_id=o.id WHERE o.placed_at>=$1
        GROUP BY oi.name ORDER BY revenue DESC LIMIT 5`,[monthStart]),
      pool.query(`SELECT id,name,emoji FROM products WHERE in_stock=false`),
    ]);

    const result = {
      today:{ orders:parseInt(todayR.rows[0].orders), revenue:parseFloat(todayR.rows[0].revenue), pending:parseInt(todayR.rows[0].pending) },
      week:{ orders:parseInt(weekR.rows[0].orders), revenue:parseFloat(weekR.rows[0].revenue) },
      month:{ orders:parseInt(monthR.rows[0].orders), revenue:parseFloat(monthR.rows[0].revenue) },
      topProducts: topR.rows.map(r=>({ name:r.name, totalQty:parseFloat(r.total_qty), revenue:parseFloat(r.revenue) })),
      outOfStock: outR.rows,
    };
    await cacheSet('stats:main', result, 60);
    res.json(result);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed' }); }
});

app.get('/api/stats/daily', authenticateOwner, async (req, res) => {
  const cached = await cacheGet('stats:daily');
  if (cached) return res.json(cached);

  try {
    const { rows } = await pool.query(`
      SELECT DATE(placed_at) as date,
             COUNT(*) as orders,
             COALESCE(SUM(total),0) as revenue
      FROM orders
      WHERE placed_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(placed_at)
      ORDER BY date ASC
    `);
    const result = rows.map(r => ({ date: r.date, orders: parseInt(r.orders), revenue: parseFloat(r.revenue) }));
    await cacheSet('stats:daily', result, 120);
    res.json(result);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed' }); }
});

// Analytics Dashboard Endpoint
app.get('/api/owner/analytics', authenticateOwner, async (req, res) => {
  try {
    const { rows: weeklyRows } = await pool.query(`
      SELECT TO_CHAR(DATE(placed_at), 'Dy') as day, DATE(placed_at) as full_date, COALESCE(SUM(total), 0) as revenue, COUNT(*) as orders
      FROM orders
      WHERE placed_at >= NOW() - INTERVAL '6 days'
      GROUP BY DATE(placed_at)
      ORDER BY DATE(placed_at) ASC
    `);

    const { rows: popularRows } = await pool.query(`
      SELECT oi.name, SUM(oi.qty) as total_qty
      FROM order_items oi JOIN orders o ON oi.order_id = o.id
      WHERE o.placed_at >= NOW() - INTERVAL '30 days'
      GROUP BY oi.name
      ORDER BY total_qty DESC
      LIMIT 10
    `);

    const { rows: townRows } = await pool.query(`
      SELECT town as name, COUNT(*) as value
      FROM orders
      WHERE town IS NOT NULL
      GROUP BY town
      ORDER BY value DESC
    `);

    res.json({
      weeklyTrends: weeklyRows.map(r => ({ ...r, revenue: parseFloat(r.revenue), orders: parseInt(r.orders) })),
      popularVegetables: popularRows.map(r => ({ name: r.name, total_qty: parseFloat(r.total_qty) })),
      townHeatmap: townRows.map(r => ({ name: r.name, value: parseInt(r.value) }))
    });
  } catch(e) {
    console.error(e); res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// 404 for unmatched API routes
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// ─── Global error handler ──────────────────────────────────────────────────────
// Anything thrown or passed to next(err) that isn't already caught lands here.
// In production this hides internal details (stack traces, DB errors, etc.)
// from the client while still logging the full error server-side.
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({
    error: IS_PRODUCTION ? 'Something went wrong' : (err.message || 'Internal server error'),
  });
});

// ─── Start server ─────────────────────────────────────────────────────────────
// Wait for the DB (tables/migrations) to be ready before accepting traffic,
// instead of racing requests against an in-progress initDb().
initDb()
  .then(() => {
    // Start the server
    httpServer.listen(port, () => {
      console.log(`Server running on port ${port} (${process.env.NODE_ENV})`);
    });

    // Start the background worker in the same process to avoid needing a separate paid worker instance
    import('./worker.js');
  })
  .catch((e) => {
    console.error('Failed to initialize database, exiting:', e);
    process.exit(1);
  });

// Graceful shutdown — let in-flight requests finish and close connections
// cleanly instead of dropping them, so container restarts/redeploys don't
// corrupt in-progress work.
const shutdown = (signal) => {
  console.log(`${signal} received, shutting down gracefully...`);
  httpServer.close(async () => {
    try {
      await pool.end();
      pubClient.disconnect();
      subClient.disconnect();
    } catch (e) {
      console.error('Error during shutdown:', e);
    }
    process.exit(0);
  });
  // Force-exit if shutdown hangs (e.g. a stuck connection)
  setTimeout(() => process.exit(1), 10000).unref();
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
