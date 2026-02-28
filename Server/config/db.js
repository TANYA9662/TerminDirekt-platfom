import pkg from 'pg';
const { Pool } = pkg;

const pool = global._pgPool || new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

if (!global._pgPool) {
  global._pgPool = pool;
  pool.on('error', (err) => console.error('DB ERROR', err));
}

export { pool };