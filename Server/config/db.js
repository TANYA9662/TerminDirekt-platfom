import pkg from 'pg';
import { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } from './env.js';

const { Pool } = pkg;

export const pool = new Pool({
  user: DB_USER,
  host: DB_HOST,
  database: DB_NAME,
  password: DB_PASSWORD,
  port: DB_PORT,
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
});

pool.connect()
  .then(() => console.log('PostgreSQL connected (SSL)'))
  .catch((err) => console.error('DB connection error', err));
