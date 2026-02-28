import pkg from 'pg';
import { DB_URL } from './env.js';
const { Pool } = pkg;

let pool;

if (!global._pgPool) {
  pool = new Pool({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false },
  });

  pool.on('error', (err) => {
    console.error('❌ Neočekivana DB greška:', err);
  });

  global._pgPool = pool;
} else {
  pool = global._pgPool;
}

export { pool };