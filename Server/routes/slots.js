import express from 'express';
import pool from '../db/pool.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const companyId = parseInt(req.query.companyId);
    if (isNaN(companyId)) return res.status(400).json({ message: 'Nevažeći companyId' });

    const result = await pool.query(
      `SELECT 
         s.id AS slot_id,
         s.start_time,
         s.end_time,
         s.is_booked,
         p.name AS provider_name
       FROM slots s
       LEFT JOIN providers p ON s.provider_id = p.id
       WHERE s.company_id = $1
       ORDER BY s.start_time ASC`,
      [companyId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Greška pri dohvaćanju slotova:", err);
    res.status(500).json({ message: 'Greška pri dohvaćanju slotova' });
  }
});

router.delete("/slots/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM slots WHERE id = $1 AND is_booked = false",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Slot ne postoji ili je rezervisan" });
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
