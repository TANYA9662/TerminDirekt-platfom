import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_2ABagh9YpHzb@ep-solitary-shadow-aic5l5b9-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false },
});

pool.connect()
  .then(() => console.log('✅ Connected to Neon'))
  .catch(console.error);

pool.on('error', (err) => {
  console.error('❌ Neočekivana DB greška:', err);
});

export { pool };