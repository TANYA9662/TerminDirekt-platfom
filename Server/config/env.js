import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Učitaj .env samo lokalno
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.join(__dirname, '../.env') });
}

// Backend port (lokalni fallback)
export const PORT = process.env.PORT || 3001;

// Neon / PostgreSQL
export const DB_URL = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || '';

// JWT secret
export const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret';

// Cloudinary
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || '';
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '';
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || '';

// Email
export const EMAIL_USER = process.env.EMAIL_USER || '';
export const EMAIL_PASS = process.env.EMAIL_PASS || '';
export const EMAIL_HOST = process.env.EMAIL_HOST || '';
export const EMAIL_PORT = process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : 587;
export const EMAIL_SECURE = process.env.EMAIL_SECURE === 'true';

// Frontend URL-ovi (fallback prazan niz)
export const FRONTEND_URLS = process.env.FRONTEND_URLS
  ? process.env.FRONTEND_URLS.split(',')
  : [];

// Backend base URL
export const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || `http://localhost:${PORT}`;