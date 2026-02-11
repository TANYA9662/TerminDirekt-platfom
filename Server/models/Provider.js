import { pool } from '../config/db.js';

export const createProvider = async ({ name, company_id, description, city, rating }) => {
  const res = await pool.query(
    `INSERT INTO providers (name, company_id, description, city, rating)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [name, company_id, description, city, rating]
  );
  return res.rows[0];
};

export const getProviderById = async (id) => {
  const res = await pool.query(
    `SELECT * FROM providers WHERE id = $1`,
    [id]
  );
  return res.rows[0];
};



export const updateProvider = async (id, data) => {
  const fields = Object.keys(data);
  const values = Object.values(data);
  const setQuery = fields.map((f, idx) => `${f}=$${idx + 1}`).join(', ');
  const res = await pool.query(
    `UPDATE providers SET ${setQuery} WHERE id=$${fields.length + 1} RETURNING *`,
    [...values, id]
  );
  return res.rows[0];
};

export const deleteProvider = async (id) => {
  await pool.query('DELETE FROM providers WHERE id=$1', [id]);
};
