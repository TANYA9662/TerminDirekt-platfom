import pool from '../db/pool.js';
import * as Booking from '../models/Booking.js';

// ====================== ADMIN ======================
// GET /api/bookings (all bookings)
export const getAllBookings = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

    const bookings = await Booking.getAllBookings();
    res.json(bookings);
  } catch (err) {
    console.error("Greška getAllBookings:", err);
    res.status(500).json({ message: 'Greška prilikom učitavanja rezervacija' });
  }
};

// ====================== KORISNIK ======================
// GET rezervation logging user
export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const r = await pool.query(
      `SELECT b.id, b.service, s.id AS slot_id, s.start_time, s.end_time,
              c.name AS company_name, c.city
       FROM bookings b
       JOIN slots s ON b.slot_id = s.id
       JOIN companies c ON b.company_id = c.id
       WHERE b.user_id = $1
       ORDER BY s.start_time ASC`,
      [userId]
    );

    res.json(r.rows);
  } catch (err) {
    console.error("Greška pri dohvaćanju rezervacija:", err);
    res.status(500).json({ message: "Greška pri dohvaćanju rezervacija", error: err.message });
  }
};

// ====================== FIRMA ======================
// GET rezervation company logging user
export const getMyCompanyBookings = async (req, res) => {
  try {
    if (req.user.role !== 'company' && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Forbidden' });

    const userId = req.user.id;
    const compRes = await pool.query('SELECT id FROM companies WHERE user_id=$1', [userId]);
    if (!compRes.rows.length) return res.status(404).json({ message: "Firma nije pronađena" });

    const companyId = compRes.rows[0].id;

    const r = await pool.query(
      `SELECT b.id, b.service, s.id AS slot_id, s.start_time, s.end_time,
              c.name AS company_name, c.city
       FROM bookings b
       JOIN slots s ON b.slot_id = s.id
       JOIN companies c ON b.company_id = c.id
       WHERE b.company_id=$1
       ORDER BY s.start_time ASC`,
      [companyId]
    );

    res.json(r.rows);
  } catch (err) {
    console.error("Greška getMyCompanyBookings:", err);
    res.status(500).json({ message: "Greška pri učitavanju rezervacija firme" });
  }
};

// ====================== PO ID ======================
// GET /api/bookings/:id
export const getBookingById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: 'Nevažeći ID rezervacije' });

    const r = await pool.query(
      `SELECT b.id, b.user_id, b.service, s.id AS slot_id, s.start_time, s.end_time,
              c.name AS company_name, c.city
       FROM bookings b
       JOIN slots s ON b.slot_id = s.id
       JOIN companies c ON b.company_id = c.id
       WHERE b.id=$1`,
      [id]
    );

    if (!r.rows.length) return res.status(404).json({ message: 'Rezervacija nije pronađena' });

    const booking = r.rows[0];

    // Just owner or admin can see it
    const companyId = await getCompanyId(req.user.id);
    if (req.user.role !== 'admin' &&
      booking.company_id !== companyId &&
      booking.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(booking);
  } catch (err) {
    console.error("Greška getBookingById:", err);
    res.status(500).json({ message: 'Greška prilikom učitavanja rezervacije' });
  }
};

// ====================== CREATE ======================
// POST /api/bookings
export const createBooking = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const userId = req.user.id;
    const { companyId, service, slotId } = req.body;

    if (!companyId || !service || !slotId) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: "companyId, service i slotId su obavezni" });
    }

    // Check if company existing
    const companyRes = await client.query('SELECT * FROM companies WHERE id=$1', [companyId]);
    if (!companyRes.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Firma nije pronađena" });
    }

    const company = companyRes.rows[0];

    // Check if comany have this service
    let services = company.services;
    if (typeof services === 'string') services = JSON.parse(services);
    const serviceExists = services.find((s) => s.name === service);
    if (!serviceExists) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: "Ne postoji ta usluga kod firme" });
    }

    // Lock slot and check if use
    const slotRes = await client.query(
      'SELECT is_booked FROM slots WHERE id=$1 FOR UPDATE',
      [slotId]
    );

    if (slotRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Slot ne postoji" });
    }

    if (slotRes.rows[0].is_booked) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: "Termin je već zauzet" });
    }

    // Create booking
    const bookingRes = await client.query(
      `INSERT INTO bookings (user_id, company_id, service, slot_id, status)
       VALUES ($1,$2,$3,$4,'pending')
       RETURNING *`,
      [userId, companyId, service, slotId]
    );

    // Make slot as booked
    await client.query('UPDATE slots SET is_booked = true WHERE id=$1', [slotId]);

    await client.query('COMMIT');
    res.status(201).json(bookingRes.rows[0]);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Greška pri kreiranju rezervacije:", err);
    res.status(500).json({ message: "Greška pri kreiranju rezervacije", error: err.message });
  } finally {
    client.release();
  }
};

// ====================== UPDATE ======================
// PUT /api/bookings/:id
export const updateBookingStatus = async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    if (isNaN(bookingId)) return res.status(400).json({ message: 'Nevažeći ID rezervacije' });

    const { status } = req.body;
    if (!status) return res.status(400).json({ message: 'Status je obavezan' });

    const booking = await Booking.getBookingById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Rezervacija nije pronađena' });

    // Samo admin ili firma koja je vlasnik rezervacije
    const companyId = await getCompanyId(req.user.id);
    if (req.user.role !== 'admin' && booking.company_id !== companyId)
      return res.status(403).json({ message: 'Forbidden' });

    const updated = await Booking.updateBookingStatus(bookingId, status);
    res.json(updated);
  } catch (err) {
    console.error("Greška updateBookingStatus:", err);
    res.status(500).json({ message: 'Greška prilikom ažuriranja rezervacije' });
  }
};

// ====================== DELETE ======================
// DELETE /api/bookings/:id
export const deleteBooking = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const bookingId = parseInt(req.params.id);
    if (isNaN(bookingId)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Nevažeći ID rezervacije' });
    }

    const bookingRes = await client.query(
      'SELECT slot_id, company_id, user_id FROM bookings WHERE id=$1 FOR UPDATE',
      [bookingId]
    );

    if (bookingRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Rezervacija nije pronađena' });
    }

    const booking = bookingRes.rows[0];

    // Check rights (admin or company)
    const companyId = await getCompanyId(req.user.id);

    const isAdmin = req.user.role === 'admin';
    const isCompanyOwner = companyId && booking.company_id === companyId;
    const isBookingOwner = booking.user_id === req.user.id;

    if (!isAdmin && !isCompanyOwner && !isBookingOwner) {
      await client.query('ROLLBACK');
      return res.status(403).json({ message: 'Forbidden' });
    }

    // DELETE booking
    await client.query('DELETE FROM bookings WHERE id=$1', [bookingId]);

    // Release slot
    await client.query('UPDATE slots SET is_booked = false WHERE id=$1', [booking.slot_id]);

    await client.query('COMMIT');
    res.json({ message: 'Rezervacija obrisana' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Greška deleteBooking:", err);
    res.status(500).json({ message: 'Greška prilikom brisanja rezervacije', error: err.message });
  } finally {
    client.release();
  }
};

// ====================== HELP FUNCTION ======================
const getCompanyId = async (userId) => {
  const res = await pool.query('SELECT id FROM companies WHERE user_id=$1', [userId]);
  return res.rows.length ? res.rows[0].id : null;
};
