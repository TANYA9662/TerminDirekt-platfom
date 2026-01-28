import express from "express";
import pool from "../db/pool.js";

const router = express.Router();

// GET /api/search?categoryId=5&city=Beograd
router.get("/", async (req, res) => {
  const { categoryId, city } = req.query;

  try {
    let query = `
      SELECT DISTINCT c.id, c.name, c.city
      FROM companies c
      LEFT JOIN company_categories cc ON cc.company_id = c.id
      WHERE 1=1
    `;

    const values = [];
    let idx = 1;

    if (categoryId) {
      query += ` AND cc.category_id = $${idx}`;
      values.push(parseInt(categoryId));
      idx++;
    }

    if (city) {
      query += ` AND c.city ILIKE $${idx}`;
      values.push(`%${city}%`);
      idx++;
    }

    query += " ORDER BY c.name ASC LIMIT 50";

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
