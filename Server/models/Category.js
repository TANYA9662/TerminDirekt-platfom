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
  return res.rows.map(cat => ({
    ...cat,
    name: cat.name.toString() // osigurava da je string
  }));
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

// GET companies for a category
export const getCompaniesByCategory = async (categoryId) => {
  const res = await pool.query(
    `
    SELECT DISTINCT
      c.id,
      c.name,
      c.city,
      c.description
    FROM companies c
    JOIN company_categories cc ON cc.company_id = c.id
    WHERE cc.category_id = $1
    ORDER BY c.name ASC
    `,
    [categoryId]
  );
  return res.rows;
};

export const getCompaniesByCategoryWithDetails = async (categoryId) => {
  const res = await pool.query(
    `
    SELECT
  c.id, c.name, c.city, c.description,
  COALESCE(
    json_agg(DISTINCT jsonb_build_object(
      'id', s.id,
      'name', s.name,
      'price', s.price,
      'duration', s.duration,
      'slots', (
        SELECT json_agg(jsonb_build_object(
          'id', sl.id,
          'start_time', sl.start_time,
          'end_time', sl.end_time,
          'is_booked', sl.is_booked
        ))
        FROM slots sl
        WHERE sl.service_id = s.id
      )
    )) FILTER (WHERE s.id IS NOT NULL),
    '[]'
  ) AS services,
  COALESCE(
    json_agg(DISTINCT jsonb_build_object(
      'id', img.id,
      'url', '/uploads/companies/' || img.image_path
    )) FILTER (WHERE img.id IS NOT NULL),
    '[]'
  ) AS images
FROM companies c
JOIN company_categories cc ON cc.company_id = c.id
LEFT JOIN services s ON s.company_id = c.id
LEFT JOIN company_images img ON img.company_id = c.id
WHERE cc.category_id = $1
GROUP BY c.id
ORDER BY c.name ASC;
    `,
    [categoryId]
  );
  return res.rows;
};
