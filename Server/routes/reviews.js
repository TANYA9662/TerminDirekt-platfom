import express from "express";
import pool from "../db/pool.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

/* ===== GET REVIEWS BY COMPANY ===== */
// GET /api/reviews?companyId=15
router.get("/", async (req, res) => {
  const companyId = parseInt(req.query.companyId);
  if (isNaN(companyId)) {
    return res.status(400).json({ message: "Nevažeći companyId" });
  }

  try {
    const r = await pool.query(
      `SELECT r.id, r.company_id, r.user_id, u.name AS user_name, r.rating, r.comment, r.created_at
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       WHERE r.company_id=$1
       ORDER BY r.created_at DESC`,
      [companyId]
    );
    res.json(r.rows);
  } catch (err) {
    console.error("Greška pri dohvaćanju recenzija:", err);
    res.status(500).json({ message: "Greška pri dohvaćanju recenzija" });
  }
});

/* ===== CREATE REVIEW ===== */
// POST /api/reviews
router.post("/", authenticateToken, async (req, res) => {
  const { companyId, rating, comment } = req.body;
  const userId = req.user.id;

  if (!companyId || !rating) {
    return res.status(400).json({ message: "companyId i rating su obavezni" });
  }

  try {
    const r = await pool.query(
      'INSERT INTO reviews (company_id, user_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
      [companyId, userId, rating, comment || null]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) {
    console.error("Greška pri dodavanju recenzije:", err);
    res.status(500).json({ message: "Greška pri dodavanju recenzije" });
  }
});

export default router;
