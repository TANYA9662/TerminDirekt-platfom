import express from 'express';
import { pool } from '../config/db.js';

const router = express.Router();

// GET /api/services?query=fr
router.get('/', async (req, res) => {
  try {
    const query = req.query.query || "";
    const result = await pool.query(
      `SELECT name 
       FROM services 
       WHERE name ILIKE $1
       ORDER BY name ASC
       LIMIT 20`,
      [`%${query}%`]
    );
    res.json(result.rows.map(r => r.name));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
