// ---------------------------------------------------------------------------
// RESET LOGIN DATA
// ---------------------------------------------------------------------------
// Wipes every customer account (and their sessions / pending password
// resets / product reviews, since those are tied to the account) and
// resets the owner account back to the default admin/admin123 credentials.
// Useful when you want a clean slate after testing. Order history is kept —
// orders store the customer's name/phone as plain columns, not a foreign
// key to their account, so deleting the account doesn't touch past orders.
//
// Usage:
//   cd backend
//   node reset_login_data.js
//
// Uses the same DB connection env vars as the server: SUPABASE_DB_URL takes
// priority, then DATABASE_URL, then localhost as a last resort.
//
// This is intentionally a standalone script (not an HTTP endpoint) — wiping
// every customer's account isn't something that should ever be reachable
// over the network, even behind auth.

import pg from 'pg';
import bcrypt from 'bcryptjs';
import readline from 'readline';

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL || process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/vrveg',
});

const DEFAULT_OWNER_USERNAME = 'admin';
const DEFAULT_OWNER_PASSWORD = 'admin123';

const args = process.argv.slice(2);
const skipConfirm = args.includes('--yes') || args.includes('-y');

function confirm(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function resetLoginData() {
  const client = await pool.connect();
  try {
    const { rows: userCountRows } = await client.query('SELECT COUNT(*)::int AS count FROM users');
    const userCount = userCountRows[0].count;

    if (!skipConfirm) {
      const answer = await confirm(
        `This will permanently delete ${userCount} customer account(s) (including their reviews and saved sessions) and reset the owner login to ${DEFAULT_OWNER_USERNAME}/${DEFAULT_OWNER_PASSWORD}. Order history is kept.\nType "yes" to continue: `
      );
      if (answer !== 'yes') {
        console.log('Cancelled — nothing was changed.');
        return;
      }
    }

    await client.query('BEGIN');

    // Sessions and pending password resets first (refresh_tokens has an FK
    // to users, but ON DELETE CASCADE already handles that — these two
    // explicit deletes just make the intent obvious and also clean up any
    // password_resets rows for numbers that don't have an account anymore).
    await client.query('DELETE FROM refresh_tokens');
    await client.query('DELETE FROM password_resets');
    const { rowCount: deletedUsers } = await client.query('DELETE FROM users');

    const hash = await bcrypt.hash(DEFAULT_OWNER_PASSWORD, 10);
    await client.query(
      `INSERT INTO owner_credentials (username, password_hash, failed_attempts, locked_until)
       VALUES ($1, $2, 0, NULL)
       ON CONFLICT (username) DO UPDATE SET password_hash = $2, failed_attempts = 0, locked_until = NULL`,
      [DEFAULT_OWNER_USERNAME, hash]
    );
    // In case some other owner username existed alongside/instead of "admin",
    // remove it so there's exactly one owner account after a reset.
    await client.query('DELETE FROM owner_credentials WHERE username <> $1', [DEFAULT_OWNER_USERNAME]);

    await client.query('COMMIT');

    console.log(`Done. Deleted ${deletedUsers} customer account(s).`);
    console.log(`Owner login reset to ${DEFAULT_OWNER_USERNAME} / ${DEFAULT_OWNER_PASSWORD}.`);
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Reset failed, no changes were made:', e);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

resetLoginData();
