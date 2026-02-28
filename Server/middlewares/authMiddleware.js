import { pool } from '../config/db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// JWT auth
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: "Nije autentifikovan" });

  jwt.verify(token, process.env.JWT_SECRET || 'tajni_kljuc', (err, user) => {
    if (err) return res.status(403).json({ message: "Nevalidan token" });
    req.user = user;
    next();
  });
};

// Role check
export const requireRole = (role) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'No user' });
  if (req.user.role !== role && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

// Owner or admin check (works for companies and company images)
export const requireOwnerOrAdmin = async (req, res, next) => {
  const userRole = req.user?.role;
  const userId = req.user?.id;

  try {
    let companyOwnerId;

    if (req.params.id) {
      // For routes with company ID
      const companyId = parseInt(req.params.id);
      if (isNaN(companyId)) return res.status(400).json({ message: 'Nevažeći ID firme' });

      const result = await pool.query('SELECT user_id FROM companies WHERE id=$1', [companyId]);
      if (!result.rows.length) return res.status(404).json({ message: 'Firma ne postoji' });

      companyOwnerId = result.rows[0].user_id;
    } else if (req.params.imageId) {
      // For routes with image ID
      const imageId = parseInt(req.params.imageId);
      if (isNaN(imageId)) return res.status(400).json({ message: 'Nevažeći ID slike' });

      const result = await pool.query(
        `SELECT c.user_id 
         FROM company_images ci 
         JOIN companies c ON ci.company_id = c.id 
         WHERE ci.id = $1`,
        [imageId]
      );
      if (!result.rows.length) return res.status(404).json({ message: 'Slika ne postoji' });

      companyOwnerId = result.rows[0].user_id;
    } else {
      return res.status(400).json({ message: 'Nije prosleđen ID' });
    }

    if (userRole === 'company' || userId === companyOwnerId) {
      return next();
    }

    return res.status(403).json({ message: 'Nemaš pravo da pristupiš ovom resursu' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Greška na serveru' });
  }
};