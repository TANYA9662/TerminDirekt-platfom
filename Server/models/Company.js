import pool from '../db/pool.js';

export const createCompany = async ({ name, category, city, address, phone, description, images }) => {
  const res = await pool.query(
    `INSERT INTO companies (name, category, city, address, phone, description, images)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [name, category, city, address, phone, description, images]
  );
  return res.rows[0];
};

export const getCompanyById = async (id) => {
  const res = await pool.query(
    `SELECT id, name, category, city, address, phone, description,
     COALESCE(images, ARRAY[]::text[]) AS images
     FROM companies WHERE id = $1`,
    [id]
  );
  return res.rows[0];
};

export const updateCompany = async (id, data) => {
  const fields = [];
  const values = [];
  let i = 1;

  for (const key in data) {
    fields.push(`${key} = $${i}`);
    values.push(data[key]);
    i++;
  }

  if (!fields.length) return getCompanyById(id);

  values.push(id);
  const res = await pool.query(
    `UPDATE companies SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
    values
  );
  return res.rows[0];
};

export const deleteCompany = async (id) => {
  await pool.query(`DELETE FROM companies WHERE id = $1`, [id]);
};

export const getAllCompanies = async ({ search = '', category = '', city = '', limit = 20, offset = 0 }) => {
  const params = [];
  let whereClause = 'WHERE 1=1';

  if (search) {
    params.push(`%${search}%`);
    whereClause += ` AND name ILIKE $${params.length}`;
  }
  if (category) {
    params.push(category);
    whereClause += ` AND category = $${params.length}`;
  }
  if (city) {
    params.push(city);
    whereClause += ` AND city = $${params.length}`;
  }

  params.push(limit, offset);

  const res = await pool.query(
    `SELECT id, name, category, city, address, phone, description,
     COALESCE(images, ARRAY[]::text[]) AS images
     FROM companies
     ${whereClause}
     ORDER BY id ASC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  return res.rows; // 🔑 vraća samo niz kompanija
};
