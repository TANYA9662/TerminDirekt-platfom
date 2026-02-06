import pool from '../db/pool.js';

/* ===== Create comany with conection with category ===== */
export const createCompanyWithCategory = async ({ name, city, address, phone, description, images, categoryId }) => {
  // Kreiraj firmu
  const companyRes = await pool.query(
    `INSERT INTO companies (name, city, address, phone, description, images)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [name, city, address, phone, description, images]
  );

  const company = companyRes.rows[0];

  // Conected company with category
  await pool.query(
    `INSERT INTO company_categories (company_id, category_id) VALUES ($1, $2)`,
    [company.id, categoryId]
  );

  return company;
};

// Add images in  company_images
export const addCompanyImages = async (companyId, files) => {
  const queries = files.map(file =>
    pool.query(
      `INSERT INTO company_images (company_id, image_path) VALUES ($1, $2)`,
      [companyId, file.filename]
    )
  );
  await Promise.all(queries);
};

// Add services
export const addServices = async (companyId, name, price, duration) => {
  const res = await pool.query(
    `INSERT INTO services (company_id, name, price, duration) VALUES ($1, $2, $3, $4) RETURNING *`,
    [companyId, name, price, duration]
  );
  return res.rows[0];
};

// Add slots for services
export const addSlots = async (serviceId, slots) => {
  const queries = slots.map(slot =>
    pool.query(
      `INSERT INTO slots (service_id, start_time, end_time) VALUES ($1, $2, $3)`,
      [serviceId, slot.start_time, slot.end_time]
    )
  );
  await Promise.all(queries);
};


/* ===== Get company by  ID ===== */
export const getCompanyById = async (id) => {
  const res = await pool.query(
    `SELECT id, name, city, address, phone, description,
     COALESCE(images, ARRAY[]::text[]) AS images
     FROM companies WHERE id = $1`,
    [id]
  );
  return res.rows[0];
};

/* ===== Update company ===== */
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

/* ===== Delete company ===== */
export const deleteCompany = async (id) => {
  await pool.query(`DELETE FROM companies WHERE id = $1`, [id]);
};

/* ===== Get all comanies with filters ===== */
export const getAllCompanies = async ({ search = '', city = '', limit = 20, offset = 0 }) => {
  const params = [];
  let whereClause = 'WHERE 1=1';

  if (search) {
    params.push(`%${search}%`);
    whereClause += ` AND name ILIKE $${params.length}`;
  }
  if (city) {
    params.push(city);
    whereClause += ` AND city = $${params.length}`;
  }

  params.push(limit, offset);

  const res = await pool.query(
    `SELECT id, name, city, address, phone, description,
     COALESCE(images, ARRAY[]::text[]) AS images
     FROM companies
     ${whereClause}
     ORDER BY id ASC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  return res.rows;
};
