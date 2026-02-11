import pkg from 'pg';
import {
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
  DB_NAME
} from './env.js';

const { Pool } = pkg;

export const pool = new Pool({
  user: DB_USER,
  host: DB_HOST,
  database: DB_NAME,
  password: DB_PASSWORD,
  port: DB_PORT,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

pool
  .connect()
  .then(() => console.log('PostgreSQL connected (SSL)'))
  .catch((err) => {
    console.error('DB connection error', err);
    process.exit(1);
  });
