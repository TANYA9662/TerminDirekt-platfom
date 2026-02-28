import pkg from 'pg';
import { DB_URL } from './env.js';

const { Pool } = pkg;

// Global pool za serverless (ne pravi nove konekcije pri svakom cold start)
let pool;

if (!global._pgPool) {
  pool = new Pool({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false }, // potrebno za Neon
  });

  // Samo lokalno test konekcije
  if (process.env.NODE_ENV !== 'production') {
    pool.connect()
      .then(() => console.log('✅ Connected to Neon'))
      .catch(console.error);
  }

  pool.on('error', (err) => {
    console.error('❌ Neočekivana DB greška:', err);
  });

  global._pgPool = pool; // čuvamo u global da serverless ne pravi novi pool
} else {
  pool = global._pgPool;
}

export { pool };