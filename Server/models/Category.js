import pool from '../db/pool.js';


export const createCategory = async ({ name }) => {
  const res = await pool.query(
    `INSERT INTO categories (name) VALUES ($1) RETURNING *`,
    [name]
  );
  return res.rows[0];
};

export const getCategoryById = async (id) => {
  const res = await pool.query('SELECT * FROM categories WHERE id=$1', [id]);
  return res.rows[0];
};


export const getAllCategories = async () => {
  const res = await pool.query(`SELECT * FROM categories ORDER BY id ASC`);
  return res.rows;
};


export const updateCategory = async (id, name) => {
  const res = await pool.query(
    'UPDATE categories SET name=$1 WHERE id=$2 RETURNING *',
    [name, id]
  );
  return res.rows[0];
};

export const deleteCategory = async (id) => {
  await pool.query('DELETE FROM categories WHERE id=$1', [id]);
};
