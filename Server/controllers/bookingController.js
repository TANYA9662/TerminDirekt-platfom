import pool from '../db/pool.js';
import * as Booking from '../models/Booking.js';

// ====================== ADMIN ======================
// GET /api/bookings (svi booking-ovi)
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
// GET rezervacije ulogovanog korisnika
export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await Booking.getBookingsByUser(userId);
    res.json(bookings);
  } catch (err) {
    console.error("Greška getMyBookings:", err);
    res.status(500).json({ message: 'Greška pri učitavanju rezervacija' });
  }
};

// ====================== FIRMA ======================
// GET rezervacije firme ulogovanog korisnika
export const getMyCompanyBookings = async (req, res) => {
  try {
    if (req.user.role !== 'company' && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Forbidden' });

    // Dohvati firmu ulogovanog korisnika iz baze
    const userId = req.user.id;
    const compRes = await pool.query('SELECT id FROM companies WHERE user_id=$1', [userId]);

    if (!compRes.rows.length) return res.status(404).json({ message: "Firma nije pronađena" });

    const companyId = compRes.rows[0].id;

    const bookings = await Booking.getByCompanyId(companyId);
    res.json(bookings);
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

    const booking = await Booking.getBookingById(id);
    if (!booking) return res.status(404).json({ message: 'Rezervacija nije pronađena' });

    // Samo vlasnik ili admin može videti
    if (
      req.user.role !== 'admin' &&
      booking.user_id !== req.user.id &&
      booking.company_id !== (await getCompanyId(req.user.id))
    ) {
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
  try {
    const { company_id, service, start_time, end_time } = req.body;
    const user_id = req.user.id;

    if (!company_id || !service || !start_time || !end_time)
      return res.status(400).json({ message: "Nedostaju obavezna polja." });

    const newBooking = await Booking.createBooking({
      user_id,
      company_id,
      service,
      start_time,
      end_time,
      status: "zakazano"
    });

    res.status(201).json(newBooking);
  } catch (err) {
    console.error("Greška createBooking:", err);
    res.status(500).json({ message: 'Greška prilikom kreiranja rezervacije' });
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
  try {
    const bookingId = parseInt(req.params.id);
    if (isNaN(bookingId)) return res.status(400).json({ message: 'Nevažeći ID rezervacije' });

    const booking = await Booking.getBookingById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Rezervacija nije pronađena' });

    const companyId = await getCompanyId(req.user.id);
    if (req.user.role !== 'admin' && booking.company_id !== companyId)
      return res.status(403).json({ message: 'Forbidden' });

    await Booking.deleteBooking(bookingId);
    res.json({ message: 'Rezervacija obrisana' });
  } catch (err) {
    console.error("Greška deleteBooking:", err);
    res.status(500).json({ message: 'Greška prilikom brisanja rezervacije' });
  }
};

// ====================== POMOĆNE FUNKCIJE ======================
const getCompanyId = async (userId) => {
  const res = await pool.query('SELECT id FROM companies WHERE user_id=$1', [userId]);
  return res.rows.length ? res.rows[0].id : null;
};
