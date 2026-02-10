import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './config/db.js';
import { PORT, FRONTEND_URL } from './config/env.js';
import apiRoutes from './routes/api.js';
import uploadRouter from './routes/uploads.js';
import { errorHandler } from './middlewares/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS
app.use(cors({ origin: FRONTEND_URL, credentials: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Pool connection dostupna za rute
app.use((req, res, next) => {
  req.pool = pool;
  next();
});

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes
app.use('/upload', uploadRouter);
app.use('/api', apiRoutes);

// Error middleware
app.use(errorHandler);

// Test route
app.get('/', (req, res) => res.send('TerminDirekt API radi! 🚀'));

// Start server
app.listen(PORT, () => {
  console.log(`Server radi na portu ${PORT}`);
});
