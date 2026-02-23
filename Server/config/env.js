import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// učitaj lokalni .env samo ako nije production
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.join(__dirname, '../.env') });
}

export const PORT = process.env.PORT || 3001;

// Database
export const DB_URL = process.env.DATABASE_URL;
export const DB_USER = process.env.DB_USER;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DB_HOST = process.env.DB_HOST;
export const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432;
export const DB_NAME = process.env.DB_NAME;

// JWT
export const JWT_SECRET = process.env.JWT_SECRET;

// Cloudinary
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

// SendGrid
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;
export const EMAIL_HOST = process.env.EMAIL_HOST;
export const EMAIL_PORT = process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : 587;
export const EMAIL_SECURE = process.env.EMAIL_SECURE === 'true';

// Frontend
export const FRONTEND_URLS = process.env.FRONTEND_URLS?.split(',') || ['http://localhost:3000'];