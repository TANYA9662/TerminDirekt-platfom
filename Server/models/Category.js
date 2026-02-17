import { pool } from '../config/db.js';

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
  const res = await pool.query(`
    SELECT c.id, c.name,
           jsonb_object_agg(t.lang_code, t.value) FILTER (WHERE t.value IS NOT NULL) AS translations
    FROM categories c
    LEFT JOIN translations t
      ON t.table_name='categories'
      AND t.column_name='name'
      AND t.row_id=c.id
    GROUP BY c.id, c.name
    ORDER BY c.id ASC
  `);

  return res.rows.map(cat => ({
    id: cat.id,
    name: cat.name,
    name_translations: cat.translations || {}
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
  c.id,
  c.name,
  c.city,
  c.description,
  COALESCE(s.services, '[]') AS services,
  COALESCE(img.images, '[]') AS images,
  COALESCE(r.avg_rating, 0) AS avg_rating,
  COALESCE(r.review_count, 0) AS review_count
FROM companies c
JOIN company_categories cc ON cc.company_id = c.id
-- services
LEFT JOIN LATERAL (
  SELECT json_agg(
    jsonb_build_object(
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
    )
  ) AS services
  FROM services s
  WHERE s.company_id = c.id
) s ON TRUE
-- images
LEFT JOIN LATERAL (
  SELECT json_agg(
    jsonb_build_object(
      'id', img.id,
      'url', '/uploads/companies/' || img.image_path
    )
  ) AS images
  FROM company_images img
  WHERE img.company_id = c.id
) img ON TRUE
-- ratings
LEFT JOIN LATERAL (
  SELECT
    AVG(r.rating)::numeric(2,1) AS avg_rating,
    COUNT(r.id) AS review_count
  FROM reviews r
  WHERE r.company_id = c.id
) r ON TRUE
WHERE cc.category_id = $1
ORDER BY c.name ASC;



    `,
    [categoryId]
  );

  return res.rows;
};


