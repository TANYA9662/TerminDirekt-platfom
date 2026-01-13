import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,  // <-- ovde
  user: process.env.DB_USER || 'malena',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'termin_direkt',
});


pool.connect()
  .then(() => console.log('✅ PostgreSQL konekcija uspešna'))
  .catch(err => console.error('❌ Greška pri povezivanju sa bazom:', err));

export default pool;
