import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import pg from 'pg';
import PDFDocument from 'pdfkit';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// ---- Environment Config ----
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const DB_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/vrveg';
const S3_ENDPOINT = process.env.S3_ENDPOINT || 'http://localhost:9000';
const S3_REGION = process.env.S3_REGION || 'us-east-1';
const S3_BUCKET = process.env.S3_BUCKET || 'vr-vegetables';

// ---- Connections ----
const redisConnection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });
const pool = new pg.Pool({ connectionString: DB_URL });

const s3Client = new S3Client({
  endpoint: S3_ENDPOINT,
  region: S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
    secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin'
  },
  forcePathStyle: true // Needed for MinIO
});

console.log('Background Worker started. Waiting for jobs...');

// ---- Worker: Invoice Generation ----
const invoiceWorker = new Worker('invoiceQueue', async job => {
  const { orderId } = job.data;
  console.log(`[Job ${job.id}] Generating invoice for order: ${orderId}`);

  // 1. Fetch order data
  const { rows: orderRows } = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
  if (orderRows.length === 0) throw new Error('Order not found');
  const order = orderRows[0];

  const { rows: itemRows } = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [orderId]);

  // 2. Generate PDF in memory
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', async () => {
      try {
        const pdfBuffer = Buffer.concat(buffers);
        const fileName = `invoices/${orderId}.pdf`;

        // 3. Upload to S3
        await s3Client.send(new PutObjectCommand({
          Bucket: S3_BUCKET,
          Key: fileName,
          Body: pdfBuffer,
          ContentType: 'application/pdf',
          ACL: 'public-read' // Note: Make bucket public in production
        }));

        console.log(`[Job ${job.id}] Uploaded invoice to S3: ${fileName}`);
        resolve({ success: true, fileName });
      } catch (err) {
        reject(err);
      }
    });

    // Write PDF content
    doc.fontSize(24).text('VR Venkataramana Vegetables', { align: 'center' });
    doc.fontSize(12).text('Farm Fresh Quality', { align: 'center', color: 'gray' });
    doc.moveDown(2);

    doc.fontSize(16).fillColor('black').text('INVOICE');
    doc.fontSize(12).text(`Order ID: #${orderId}`);
    doc.text(`Date: ${new Date(order.placed_at).toLocaleString()}`);
    doc.text(`Customer: ${order.customer_name} (${order.phone})`);
    doc.text(`Delivery: ${order.area}, ${order.town}`);
    doc.moveDown(1);

    // Table Header
    const tableTop = doc.y;
    doc.font('Helvetica-Bold');
    doc.text('Item', 50, tableTop);
    doc.text('Qty', 300, tableTop);
    doc.text('Price', 400, tableTop);
    doc.text('Total', 500, tableTop);
    doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
    doc.moveDown(0.5);

    // Table Rows
    let y = doc.y;
    doc.font('Helvetica');
    itemRows.forEach(item => {
      const itemTotal = Number(item.qty) * Number(item.price);
      doc.text(`${item.name}`, 50, y);
      doc.text(`${item.qty}`, 300, y);
      doc.text(`₹${item.price}`, 400, y);
      doc.text(`₹${itemTotal.toFixed(2)}`, 500, y);
      y += 20;
    });

    doc.moveTo(50, y + 10).lineTo(550, y + 10).stroke();
    y += 20;
    doc.font('Helvetica-Bold');
    doc.text('Subtotal:', 400, y);
    doc.text(`₹${order.subtotal}`, 500, y);
    y += 20;
    doc.text('Delivery Fee:', 400, y);
    doc.text(`₹${order.delivery_fee}`, 500, y);
    if (order.discount && Number(order.discount) > 0) {
      y += 20;
      doc.text('Discount:', 400, y);
      doc.text(`-₹${order.discount}`, 500, y);
    }
    y += 20;
    doc.fontSize(14).text('Total Paid:', 400, y);
    doc.text(`₹${order.total}`, 500, y);

    doc.end();
  });
}, { connection: redisConnection });

// ---- Worker: Notification Queue ----
const notifyWorker = new Worker('notifyQueue', async job => {
  const { type, phone, message } = job.data;
  console.log(`[Job ${job.id}] Sending ${type} SMS to ${phone}: ${message}`);
  
  // Here we would integrate Twilio or AWS SNS.
  // For now, simulate network delay
  await new Promise(r => setTimeout(r, 1000));
  console.log(`[Job ${job.id}] Sent successfully`);
}, { connection: redisConnection });

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down workers...');
  await invoiceWorker.close();
  await notifyWorker.close();
  await pool.end();
  redisConnection.disconnect();
  process.exit(0);
});
