import pool from '../db/pool.js';

// ✔ CREATE BOOKING
export const createBooking = async ({
  user_id,
  company_id,
  service,
  slot_time,        // koristi slot_time umesto start_time i end_time
  status = 'pending'
}) => {
  const userId = parseInt(user_id);
  const companyId = parseInt(company_id);

  if (isNaN(userId) || isNaN(companyId)) {
    throw new Error('Nevažeći ID');
  }

  const res = await pool.query(
    `INSERT INTO bookings (user_id, company_id, service, slot_time, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, companyId, service, slot_time, status]
  );
  return res.rows[0];
};

// ✔ GET BOOKINGS FOR USER
export const getBookingsByUser = async (userId) => {
  const res = await pool.query(`
    SELECT
      b.id,
      b.service,
      b.slot_time,
      b.status
    FROM bookings b
    WHERE b.user_id = $1
    ORDER BY b.slot_time DESC
  `, [userId]);

  return res.rows;
};

// ✔ GET BOOKING BY ID
export const getByCompanyId = async (companyId) => {
  const res = await pool.query(`
    SELECT b.id, b.service, b.slot_time, b.status, u.email AS user_email
    FROM bookings b
    JOIN users u ON u.id = b.user_id
    WHERE b.company_id = $1
    ORDER BY b.slot_time DESC
  `, [companyId]);

  return res.rows;
};




// ✔ GET COMPANY BY USER
export const getCompanyByUser = async (userId) => {
  const id = parseInt(userId);
  if (isNaN(id)) throw new Error('Nevažeći ID korisnika');

  const res = await pool.query(
    "SELECT * FROM companies WHERE user_id = $1",
    [id]
  );
  return res.rows[0] || null;
};

// ✔ GET BOOKINGS BY PROVIDER
export const getBookingsByProvider = async (provider_id) => {
  const provId = parseInt(provider_id);
  if (isNaN(provId)) throw new Error('Nevažeći ID providera');

  const res = await pool.query(
    `SELECT * FROM bookings 
     WHERE provider_id = $1
     ORDER BY slot_time ASC`,
    [provId]
  );
  return res.rows;
};


// ✔ GET ALL BOOKINGS (admin)
export const getAllBookings = async () => {
  const res = await pool.query(
    `SELECT * FROM bookings ORDER BY slot_time DESC`
  );
  return res.rows;
};

// ✔ UPDATE BOOKING STATUS
export const updateBookingStatus = async (booking_id, status) => {
  const id = parseInt(booking_id);
  if (isNaN(id)) throw new Error('Nevažeći ID rezervacije');

  const res = await pool.query(
    `UPDATE bookings 
     SET status = $1 
     WHERE id = $2 
     RETURNING *`,
    [status, id]
  );
  return res.rows[0];
};

// ✔ DELETE BOOKING
export const deleteBooking = async (booking_id) => {
  const id = parseInt(booking_id);
  if (isNaN(id)) throw new Error('Nevažeći ID rezervacije');

  await pool.query(`DELETE FROM bookings WHERE id = $1`, [id]);
};
