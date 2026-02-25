import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.join(__dirname, '../.env') });
}

// Backend port
export const PORT = process.env.PORT || 3001;

// Neon / PostgreSQL
export const DB_URL = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

// JWT
export const JWT_SECRET = process.env.JWT_SECRET;

// Cloudinary za slike
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

// Email konfiguracija
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;
export const EMAIL_HOST = process.env.EMAIL_HOST;
export const EMAIL_PORT = process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : 587;
export const EMAIL_SECURE = process.env.EMAIL_SECURE === 'true';

// Frontend URL-ovi
export const FRONTEND_URLS = process.env.FRONTEND_URLS?.split(',') || ['http://localhost:3000'];

// Base URL backend-a za lokalni razvoj ili produkciju (za statičke fajlove)
export const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || `http://localhost:${PORT}`;