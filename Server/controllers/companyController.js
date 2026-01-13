import pool from '../db/pool.js';
import fs from 'fs';
import path from 'path';

/* ================== IMAGES ================== */
const uploadCompanyImages = async (req, res) => {
  try {
    const companyId = parseInt(req.params.id);
    if (isNaN(companyId)) return res.status(400).json({ message: 'Nevažeći ID firme' });
    if (!req.files?.length) return res.status(400).json({ message: 'Nema fajlova' });

    const { rows } = await pool.query(
      'SELECT user_id FROM companies WHERE id=$1',
      [companyId]
    );
    if (!rows.length) return res.status(404).json({ message: 'Firma ne postoji' });

    if (req.user.role !== 'admin' && req.user.id !== rows[0].user_id) {
      return res.status(403).json({ message: 'Nemate pravo' });
    }

    const saved = [];
    for (const file of req.files) {
      const relPath = `/uploads/companies/${path.basename(file.path)}`;
      const r = await pool.query(
        'INSERT INTO company_images (company_id, image_path) VALUES ($1,$2) RETURNING *',
        [companyId, relPath]
      );
      saved.push(r.rows[0]);
    }

    res.status(201).json({ images: saved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Upload error' });
  }
};

/* ================== GET ================== */
const getAllCompanies = async (_, res) => {
  const r = await pool.query('SELECT * FROM companies ORDER BY id DESC');
  res.json(r.rows);
};

const getCompanyByUser = async (req, res) => {
  const userId = Number(req.params.userId || req.params.id);
  if (isNaN(userId)) return res.status(400).json({ message: 'Nevažeći user ID' });

  const r = await pool.query(
    `SELECT * FROM companies WHERE user_id = $1 ORDER BY id DESC LIMIT 1`,
    [userId]
  );

  res.json(r.rows[0] || null);
};

const getCompanyImages = async (req, res) => {
  const id = Number(req.params.id);
  const r = await pool.query(
    'SELECT * FROM company_images WHERE company_id=$1',
    [id]
  );
  res.json(r.rows);
};

const getMyCompany = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT * FROM companies WHERE user_id = $1 ORDER BY id DESC LIMIT 1`,
      [req.user.id]
    );
    res.json(r.rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Greška pri dohvaćanju firme" });
  }
};

const getCompanyWithDetails = async (req, res) => {
  const userId = parseInt(req.params.id);
  if (isNaN(userId)) return res.status(400).json({ message: 'Nevažeći ID korisnika' });

  try {
    const companyRes = await pool.query(
      `SELECT * FROM companies WHERE user_id = $1 ORDER BY id DESC LIMIT 1`,
      [userId]
    );

    const company = companyRes.rows[0];
    if (!company) return res.status(404).json({ message: 'Firma nije pronađena' });

    const imagesRes = await pool.query(
      'SELECT id, image_path FROM company_images WHERE company_id=$1',
      [company.id]
    );

    let services = company.services;
    if (typeof services === 'string') services = JSON.parse(services);

    res.json({ ...company, services, images: imagesRes.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Greška pri dohvaćanju podataka' });
  }
};

/* ================== SEARCH ================== */
const searchCompanies = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'q je obavezan' });

    const r = await pool.query(
      'SELECT * FROM companies WHERE name ILIKE $1 OR city ILIKE $1',
      [`%${q}%`]
    );
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Search error' });
  }
};

/* ================== DELETE ================== */
const deleteCompany = async (req, res) => {
  const id = Number(req.params.id);
  await pool.query('DELETE FROM companies WHERE id=$1', [id]);
  res.json({ message: 'Firma obrisana' });
};

export const deleteCompanyImage = async (req, res) => {
  try {
    const imageId = Number(req.params.imageId);
    if (isNaN(imageId)) return res.status(400).json({ message: 'Nevažeći ID slike' });

    const r = await pool.query(
      `SELECT ci.*, c.user_id 
       FROM company_images ci
       JOIN companies c ON ci.company_id = c.id
       WHERE ci.id=$1`,
      [imageId]
    );

    if (!r.rows.length) return res.status(404).json({ message: 'Slika nije pronađena' });
    const image = r.rows[0];

    if (req.user.role !== 'admin' && req.user.id !== image.user_id) {
      return res.status(403).json({ message: 'Nemate pravo da obrišete ovu sliku' });
    }

    const filePath = path.join('public', image.image_path);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await pool.query('DELETE FROM company_images WHERE id=$1', [imageId]);
    res.json({ message: 'Slika obrisana' });
  } catch (err) {
    console.error('Delete image error:', err);
    res.status(500).json({ message: 'Greška pri brisanju slike' });
  }
};

/* ================== CREATE / UPSERT ================== */
const upsertCompany = async (req, res) => {
  try {
    const companyId = req.body.id ? parseInt(req.body.id, 10) : null;
    const userId = req.body.userId ? parseInt(req.body.userId, 10) : req.user.id;

    let services = [];
    if (req.body.services) {
      services = typeof req.body.services === 'string' ? JSON.parse(req.body.services) : req.body.services;
    }

    if (companyId) {
      const exists = await pool.query('SELECT id FROM companies WHERE id=$1', [companyId]);
      if (exists.rows.length) {
        const fields = [];
        const values = [];
        let i = 1;

        for (const key of ['name', 'city', 'description']) {
          if (req.body[key]) { fields.push(`${key}=$${i++}`); values.push(req.body[key]); }
        }

        if (services.length > 0) { fields.push(`services=$${i++}`); values.push(JSON.stringify(services)); }

        if (!fields.length) return res.status(400).json({ message: 'Nema podataka za update' });

        values.push(companyId);
        const r = await pool.query(
          `UPDATE companies SET ${fields.join(', ')} WHERE id=$${i} RETURNING *`,
          values
        );
        return res.json(r.rows[0]);
      }
    }

    const { name, city, description } = req.body;
    if (!name || !city) return res.status(400).json({ message: 'name i city su obavezni' });

    const r = await pool.query(
      `INSERT INTO companies (name, city, description, user_id, services)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [name.trim(), city.trim(), description || null, userId, JSON.stringify(services)]
    );

    return res.status(201).json({ company: r.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Greška pri upsertu kompanije', error: err.message });
  }
};

/* ================== UPDATE ================== */
const updateCompany = async (req, res) => {
  const id = Number(req.params.id);
  const fields = [];
  const values = [];
  let i = 1;

  for (const key of ['name', 'city', 'description']) {
    if (req.body[key]) { fields.push(`${key}=$${i++}`); values.push(req.body[key]); }
  }

  if (req.body.services) {
    let services = req.body.services;
    if (typeof services === 'string') {
      try { services = JSON.parse(services); }
      catch { return res.status(400).json({ message: 'Nevažeći format services' }); }
    }
    fields.push(`services=$${i++}`);
    values.push(JSON.stringify(services));
  }

  if (!fields.length) return res.status(400).json({ message: 'Nema podataka za update' });

  values.push(id);
  const r = await pool.query(
    `UPDATE companies SET ${fields.join(', ')} WHERE id=$${i} RETURNING *`,
    values
  );

  res.json(r.rows[0]);
};

/* ================== NOVO: UPDATE SERVICES ================== */
const updateCompanyServices = async (req, res) => {
  try {
    const companyId = parseInt(req.params.id);
    if (isNaN(companyId)) return res.status(400).json({ message: 'Nevažeći ID firme' });

    let services = req.body.services;
    if (!services || !Array.isArray(services)) {
      return res.status(400).json({ message: 'services mora biti niz objekata {name, price}' });
    }

    const r = await pool.query(
      'UPDATE companies SET services=$1 WHERE id=$2 RETURNING *',
      [JSON.stringify(services), companyId]
    );

    res.json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Greška pri update services', error: err.message });
  }
};

/* ================== EXPORT ================== */
export default {
  uploadCompanyImages,
  getAllCompanies,
  getCompanyByUser,
  getCompanyWithDetails,
  getCompanyImages,
  getMyCompany,
  searchCompanies,
  createCompany: upsertCompany,
  updateCompany,
  updateCompanyServices, // NOVO
  upsertCompany,
  deleteCompany,
  deleteCompanyImage,
};
