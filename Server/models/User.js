import pool from '../db/pool.js';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export const createUser = async ({ ime, email, lozinka, role = 'user' }) => {
  const hashedPassword = await bcrypt.hash(lozinka, SALT_ROUNDS);
  const res = await pool.query(
    `INSERT INTO korisnici (ime, email, lozinka, role)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [ime, email, hashedPassword, role]
  );
  return res.rows[0];
};

export const getUserByEmail = async (email) => {
  const res = await pool.query(
    `SELECT * FROM korisnici WHERE email = $1`,
    [email]
  );
  return res.rows[0] || null;
};
