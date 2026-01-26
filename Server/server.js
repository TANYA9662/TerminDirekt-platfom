import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import pool from './db/pool.js';
import { errorHandler } from './middlewares/errorMiddleware.js';
import apiRoutes from './routes/api.js';  // sve rute kroz api.js

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// statički fajlovi
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// prosledi pool
app.use((req, res, next) => {
  req.pool = pool;
  next();
});

// sve rute kroz api.js
app.use('/api', apiRoutes);

// error middleware
app.use(errorHandler);

// test ruta
app.get('/', (req, res) => res.send('TerminDirekt API radi! 🚀'));

app.listen(PORT, () => {
  console.log(`Server radi na portu ${PORT}`);
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Loaded' : '❌ Missing');
});
