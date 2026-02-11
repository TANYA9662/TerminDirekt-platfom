import { pool } from '../config/db.js';

// CREATE BOOKING
export const createBooking = async ({ user_id, company_id, service, slot_id, status = 'pending' }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Lock slot
    const slotRes = await client.query('SELECT is_booked FROM slots WHERE id=$1 FOR UPDATE', [slot_id]);
    if (slotRes.rowCount === 0) throw new Error('Slot ne postoji');
    if (slotRes.rows[0].is_booked) throw new Error('Termin je već zauzet');

    // Create booking
    const bookingRes = await client.query(
      `INSERT INTO bookings (user_id, company_id, service, slot_id, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [user_id, company_id, service, slot_id, status]
    );

    // Set slots as booked
    await client.query('UPDATE slots SET is_booked = true WHERE id=$1', [slot_id]);

    await client.query('COMMIT');
    return bookingRes.rows[0];

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// GET BOOKINGS FOR USER
export const getBookingsByUser = async (userId) => {
  const res = await pool.query(
    `SELECT b.id, b.service, b.status, s.id AS slot_id, s.start_time, s.end_time
     FROM bookings b
     JOIN slots s ON b.slot_id = s.id
     WHERE b.user_id = $1
     ORDER BY s.start_time DESC`,
    [userId]
  );
  return res.rows;
};

// GET BOOKINGS BY COMPANY
export const getByCompanyId = async (companyId) => {
  const res = await pool.query(
    `SELECT b.id, b.service, b.status, s.id AS slot_id, s.start_time, s.end_time,
            u.email AS user_email
     FROM bookings b
     JOIN slots s ON b.slot_id = s.id
     JOIN users u ON u.id = b.user_id
     WHERE b.company_id = $1
     ORDER BY s.start_time DESC`,
    [companyId]
  );
  return res.rows;
};

// GET BOOKING BY ID
export const getBookingById = async (bookingId) => {
  const res = await pool.query(
    `SELECT b.id, b.service, b.status, s.id AS slot_id, s.start_time, s.end_time,
            c.name AS company_name, u.email AS user_email
     FROM bookings b
     JOIN slots s ON b.slot_id = s.id
     JOIN companies c ON b.company_id = c.id
     JOIN users u ON b.user_id = u.id
     WHERE b.id = $1`,
    [bookingId]
  );
  return res.rows[0] || null;
};

// UPDATE BOOKING STATUS
export const updateBookingStatus = async (booking_id, status) => {
  const res = await pool.query(
    `UPDATE bookings SET status=$1 WHERE id=$2 RETURNING *`,
    [status, booking_id]
  );
  return res.rows[0];
};

// DELETE BOOKING
export const deleteBooking = async (booking_id) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const bookingRes = await client.query('SELECT slot_id FROM bookings WHERE id=$1 FOR UPDATE', [booking_id]);
    if (!bookingRes.rows.length) throw new Error('Rezervacija ne postoji');

    const slotId = bookingRes.rows[0].slot_id;

    await client.query('DELETE FROM bookings WHERE id=$1', [booking_id]);

    if (slotId) {
      await client.query('UPDATE slots SET is_booked=false WHERE id=$1', [slotId]);
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// GET ALL BOOKINGS (ADMIN)
export const getAllBookings = async () => {
  const res = await pool.query(
    `SELECT b.id, b.service, b.status, s.id AS slot_id, s.start_time, s.end_time
     FROM bookings b
     JOIN slots s ON b.slot_id = s.id
     ORDER BY s.start_time DESC`
  );
  return res.rows;
};
