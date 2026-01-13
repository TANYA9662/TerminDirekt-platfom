import express from 'express';
import pool from '../db/pool.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { authenticateToken } from '../middlewares/authMiddleware.js';

dotenv.config();

const router = express.Router();

// ================= REGISTER =================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, city, phone } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Obavezna polja: name, email, password, role' });
    }

    // Provera da li email postoji
    const userExists = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Email je već registrovan' });
    }

    // Hash lozinke
    const hashedPassword = await bcrypt.hash(password, 10);

    // Ubacivanje korisnika
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, city, phone)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, name, email, role, city, phone`,
      [name, email, hashedPassword, role, city || null, phone || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Greška pri registraciji:', err);
    res.status(500).json({ message: 'Greška pri registraciji', error: err.message });
  }
});

// ================= LOGIN =================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email i password su obavezni' });
    }

    const r = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    const user = r.rows[0];
    if (!user) return res.status(400).json({ message: 'Neispravan email ili lozinka' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Neispravan email ili lozinka' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, city: user.city, phone: user.phone } });
  } catch (err) {
    console.error('Greška pri loginu:', err);
    res.status(500).json({ message: 'Greška pri loginu', error: err.message });
  }
});

// ================= GET /me =================
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const r = await pool.query('SELECT id, name, email, role, city, phone FROM users WHERE id=$1', [req.user.id]);
    if (!r.rows.length) return res.status(404).json({ message: 'Korisnik nije pronađen' });
    res.json(r.rows[0]);
  } catch (err) {
    console.error('Greška pri /me:', err);
    res.status(500).json({ message: 'Greška pri dohvaćanju korisnika', error: err.message });
  }
});

export default router;
