import express from "express";
import pool from "../db/pool.js";

const router = express.Router();

// GET /api/search?service=Frizer&city=Beograd
router.get("/", async (req, res) => {
  const { service, city } = req.query;

  try {
    let query = `
      SELECT c.id, c.name, c.city
      FROM companies c
      JOIN company_services cs ON c.id = cs.company_id
      JOIN services s ON s.id = cs.service_id
      WHERE 1=1
    `;

    const values = [];
    let idx = 1;

    if (service) {
      query += ` AND s.name ILIKE $${idx}`;
      values.push(`%${service}%`);
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
    console.error("Error searching companies:", err);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
