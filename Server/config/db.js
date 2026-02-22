// Server/config/db.js
import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Neon connection string iz Vercel env
  ssl: { rejectUnauthorized: false },
});

// Opcionalno logovanje
pool
  .connect()
  .then(() => console.log('PostgreSQL connected (Neon, SSL)'))
  .catch((err) => {
    console.error('DB connection error', err);
    process.exit(1);
  });