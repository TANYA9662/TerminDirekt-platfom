import dotenv from "dotenv";
dotenv.config();
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { pool } from './config/db.js';
import { FRONTEND_URLS, PORT } from './config/env.js';
import apiRoutes from './routes/api.js';
import uploadRouter from './routes/uploads.js';
import { errorHandler } from './middlewares/errorMiddleware.js';
import { langMiddleware } from './middlewares/langMiddleware.js';
import path from 'path';
import { fileURLToPath } from 'url';


console.log("DATABASE_URL:", process.env.DATABASE_URL);


const app = express();

// __dirname za ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================== Statika za slike ==================
// Sve slike iz /public/uploads dostupne preko /uploads
app.use(
  '/uploads',
  (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // dozvoli bilo koji frontend
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'); // ORB
    next();
  },
  express.static(path.join(__dirname, 'public/uploads'))
);

// ================== CORS za API ==================
const allowedOrigins = Array.isArray(FRONTEND_URLS)
  ? FRONTEND_URLS
  : FRONTEND_URLS.split(',');

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Postman / curl
      if (allowedOrigins.includes(origin) || origin?.includes('.vercel.app'))
        return callback(null, true);
      callback(new Error('CORS nije dozvoljen za ovaj origin: ' + origin));
    },
    credentials: true,
  })
);

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

// ================== Start servera ==================
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () =>
    console.log(`🚀 Server radi na http://localhost:${PORT}`)
  );
}

export default app;