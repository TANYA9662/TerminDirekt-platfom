import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';

import { pool } from '../config/db.js';
import cloudinary from '../utils/cloudinary.js';
import { JWT_SECRET } from '../config/env.js';

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ---------- TEST ROUTES ----------
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ time: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/test-cloudinary', (req, res) => {
  res.json({ message: 'Cloudinary configured' });
});

app.get('/api/test-jwt', (req, res) => {
  const token = jwt.sign({ user: 'malena' }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// ---------- SERVERLESS EXPORT ----------
export default app;
export const handler = serverless(app);