import dotenv from "dotenv";
dotenv.config();
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { pool } from './config/db.js';
import { FRONTEND_URLS } from './config/env.js';
import apiRoutes from './routes/api.js';
import uploadRouter from './routes/uploads.js';
import { errorHandler } from './middlewares/errorMiddleware.js';
import { langMiddleware } from './middlewares/langMiddleware.js';

const app = express();

// ================== CORS ==================
const allowedOrigins = Array.isArray(FRONTEND_URLS) ? FRONTEND_URLS : [];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Postman / curl
    if (allowedOrigins.includes(origin) || origin?.includes('.vercel.app'))
      return callback(null, true);
    callback(new Error('CORS nije dozvoljen za ovaj origin: ' + origin));
  },
  credentials: true,
}));

// ================== Body parser ==================
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ================== DB pool ==================
app.use((req, res, next) => {
  req.pool = pool;
  next();
});

// ================== Middlewares ==================
app.use(langMiddleware);

// ================== Routes ==================
app.use('/upload', uploadRouter);
app.use('/api', apiRoutes);

// ================== Error handler ==================
app.use(errorHandler);

// ================== Test ruta ==================
app.get('/', (req, res) => res.send('TerminDirekt API radi! 🚀'));

// ================== Server start (lokalno) ==================
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`🚀 Server radi na http://localhost:${PORT}`));
}

export default app;