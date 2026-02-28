import pkg from 'pg';
const { Pool } = pkg;
import { DB_URL } from './env.js';

const pool = new Pool({
  connectionString: DB_URL, // koristi env var
  ssl: { rejectUnauthorized: false }, // potrebno za Neon
});

// Samo lokalno test konekcije
if (process.env.NODE_ENV !== 'production') {
  pool.connect()
    .then(() => console.log('✅ Connected to Neon'))
    .catch(console.error);
}

// Global error handler za pool
pool.on('error', (err) => {
  console.error('❌ Neočekivana DB greška:', err);
});

export { pool };