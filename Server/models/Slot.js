import { pool } from '../config/db.js';
import * as Slot from '../models/Slot.js';

// CREATE
export const createSlot = async ({ provider_id, start_time, end_time, is_booked }) => {
  const res = await pool.query(
    `INSERT INTO slots (provider_id, start_time, end_time, is_booked)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [provider_id, start_time, end_time, is_booked]
  );
  return res.rows[0];
};

// READ all
export const getAllSlots = async () => {
  const res = await pool.query('SELECT * FROM slots');
  return res.rows;
};

// READ by ID
export const getSlotById = async (id) => {
  const res = await pool.query('SELECT * FROM slots WHERE id=$1', [id]);
  return res.rows[0];
};

// UPDATE
export const updateSlot = async (id, data) => {
  const fields = [];
  const values = [];
  let i = 1;

  for (const key in data) {
    fields.push(`${key}=$${i}`);
    values.push(data[key]);
    i++;
  }

  const res = await pool.query(
    `UPDATE slots SET ${fields.join(', ')} WHERE id=$${i} RETURNING *`,
    [...values, id]
  );
  return res.rows[0];
};

// DELETE
export const deleteSlot = async (id) => {
  await pool.query('DELETE FROM slots WHERE id=$1', [id]);
};
