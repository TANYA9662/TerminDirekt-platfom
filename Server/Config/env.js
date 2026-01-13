import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitno učitavanje .env iz root foldera
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const PORT = process.env.PORT || 3001;
export const DB_USER = process.env.DB_USER || 'malena';
export const DB_PASSWORD = process.env.DB_PASSWORD || '';
export const DB_HOST = process.env.DB_HOST || 'localhost';
export const DB_PORT = process.env.DB_PORT || 5432;
export const DB_NAME = process.env.DB_NAME || 'termin_direkt';
export const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET nije definisan u .env fajlu!");
}
