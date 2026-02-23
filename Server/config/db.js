import pkg from 'pg';
import { DB_URL, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } from './env.js';
const { Pool } = pkg;

const isProd = !!DB_URL;

export const pool = new Pool({
  connectionString: isProd ? DB_URL : undefined,
  user: isProd ? undefined : DB_USER,
  password: isProd ? undefined : DB_PASSWORD,
  host: isProd ? undefined : DB_HOST,
  port: isProd ? undefined : DB_PORT,
  database: isProd ? undefined : DB_NAME,
  ssl: isProd ? { rejectUnauthorized: false } : false,
});

// test konekcije
pool.connect()
  .then(() => console.log(`✅ PostgreSQL connected (${isProd ? 'Neon / SSL' : 'Local'})`))
  .catch(err => {
    console.error('❌ DB connection error', err);
    process.exit(1);
  });