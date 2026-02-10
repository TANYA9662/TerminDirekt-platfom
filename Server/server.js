import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import pool from './db/pool.js';
import { errorHandler } from './middlewares/errorMiddleware.js';
import apiRoutes from './routes/api.js';
import uploadRouter from "./routes/uploads.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// ⚡ CORS - dozvoli frontend sa Vercel-a ili localhost-a
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// pool connection dostupna za rute
app.use((req, res, next) => {
  req.pool = pool;
  next();
});

// ⚡ Serve static files za avatar i company uploads
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// upload ruta (Cloudinary / lokalno)
app.use("/upload", uploadRouter);

// sve ostale API rute
app.use('/api', apiRoutes);

// error middleware
app.use(errorHandler);

// test route
app.get('/', (req, res) => res.send('TerminDirekt API radi! 🚀'));

// start server
app.listen(PORT, () => {
  console.log(`Server radi na portu ${PORT}`);
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Loaded' : '❌ Missing');
});
