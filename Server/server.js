import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './config/db.js';
import { PORT, FRONTEND_URLS } from './config/env.js';
import apiRoutes from './routes/api.js';
import uploadRouter from './routes/uploads.js';
import { errorHandler } from './middlewares/errorMiddleware.js';
import { langMiddleware } from './middlewares/langMiddleware.js'; // aktiviramo middleware




const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();


// ================== CORS ==================
const allowedOrigins = Array.isArray(FRONTEND_URLS)
  ? FRONTEND_URLS
  : FRONTEND_URLS.split(',');

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Postman / server-side requests

    if (
      allowedOrigins.includes(origin) ||
      origin?.includes('.vercel.app')
    ) {
      return callback(null, true);
    }

    console.log('❌ CORS blocked for:', origin);
    callback(new Error('CORS nije dozvoljen za ovaj origin: ' + origin));
  },
  credentials: true
}));

// ================== Body parsers ==================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================== DB Pool ==================
app.use((req, res, next) => {
  req.pool = pool;
  next();
});

// ================== Language Middleware ==================
app.use(langMiddleware); // req.lang će biti dostupan u svim rutama

// ================== Static Files ==================
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// ================== Routes ==================
app.use('/upload', uploadRouter);
app.use('/api', apiRoutes);

// ================== Error Handling ==================
app.use(errorHandler);

// ================== Test Route ==================
app.get('/', (req, res) => res.send('TerminDirekt API radi! 🚀'));

// ================== Start Server ==================
app.listen(PORT, () => {
  console.log(`Server radi na portu ${PORT}`);
});
