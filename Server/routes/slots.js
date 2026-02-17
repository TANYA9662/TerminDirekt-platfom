import express from 'express';
import { pool } from '../config/db.js';

const router = express.Router();

/* ===== GET: Dohvati slotove po companyId ===== */
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
         s.service_id,
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

/* ===== DELETE: Obriši slot ako nije rezervisan ===== */
router.delete('/slots/:id', async (req, res, next) => {
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

/* ===== PUT: Kreiraj ili update slotove (za postojeće i nove usluge) ===== */
router.put('/company/:companyId/slots', async (req, res) => {
  const { companyId } = req.params;
  const { slots } = req.body; // slots = [{ service_id, tempServiceId, start_time, end_time, id? }]

  try {
    const savedSlots = [];

    for (const slot of slots) {
      let serviceId = slot.service_id;

      // Ako postoji tempServiceId, pokušaj da nađeš pravi id
      if (!serviceId && slot.tempServiceId) {
        const serviceRes = await pool.query(
          'SELECT id FROM services WHERE temp_id=$1 AND company_id=$2',
          [slot.tempServiceId, companyId]
        );
        if (serviceRes.rows.length) {
          serviceId = serviceRes.rows[0].id;
        } else {
          // Ako još uvek ne postoji, preskoči slot dok se usluga ne sačuva
          continue;
        }
      }

      if (!serviceId) continue;

      // Kreiraj ili update slot
      if (slot.id && !String(slot.id).startsWith('temp-')) {
        // update
        const updateRes = await pool.query(
          `UPDATE slots 
           SET start_time=$1, end_time=$2
           WHERE id=$3 AND service_id=$4
           RETURNING *`,
          [slot.start_time, slot.end_time, slot.id, serviceId]
        );
        if (updateRes.rows.length) savedSlots.push(updateRes.rows[0]);
      } else {
        // create
        const insertRes = await pool.query(
          `INSERT INTO slots (service_id, start_time, end_time)
           VALUES ($1, $2, $3) RETURNING *`,
          [serviceId, slot.start_time, slot.end_time]
        );
        savedSlots.push(insertRes.rows[0]);
      }
    }

    res.json(savedSlots);
  } catch (err) {
    console.error("Greška pri update-u slotova:", err);
    res.status(500).json({ error: "Greška pri update-u slotova" });
  }
});

export default router;
