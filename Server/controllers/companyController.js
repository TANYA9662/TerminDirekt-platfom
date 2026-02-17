import cloudinary from "../config/cloudinary.js";
import { deleteImageById } from "../utils/deleteImageById.js";
import { buildImageUrl } from "../utils/buildImageUrl.js";
import { pool } from '../config/db.js';
import fs from 'fs';
import path from 'path';

/* ================== IMAGES ================== */
export const uploadCompanyImages = async (req, res) => {
  try {
    const companyId = Number(req.params.id);
    if (isNaN(companyId)) return res.status(400).json({ message: 'Nevažeći ID firme' });
    if (!req.files || req.files.length === 0) return res.status(400).json({ message: 'Nema fajlova za upload' });

    const saved = [];
    for (const file of req.files) {
      // snimi u bazu
      const r = await pool.query(
        'INSERT INTO company_images (company_id, image_path) VALUES ($1, $2) RETURNING *',
        [companyId, file.filename]
      );

      const img = r.rows[0];
      saved.push({
        ...img,
        url: buildImageUrl(img)   // pun URL
      });
    }

    res.status(201).json({ images: saved });
  } catch (err) {
    console.error('uploadCompanyImages error:', err);
    res.status(500).json({ message: 'Greška pri uploadu slika', error: err.message });
  }
};

export const getCompanyImages = async (req, res) => {
  try {
    const companyId = Number(req.params.id);
    if (isNaN(companyId)) return res.status(400).json({ message: 'Nevažeći ID firme' });

    const r = await pool.query('SELECT * FROM company_images WHERE company_id=$1', [companyId]);

    const imagesWithUrl = r.rows.map(img => ({
      ...img,
      url: buildImageUrl(img)   // pun URL
    }));

    res.json(imagesWithUrl);
  } catch (err) {
    console.error("getCompanyImages error:", err);
    res.status(500).json({ message: "Greška pri učitavanju slika", error: err.message });
  }
};


export const deleteCompanyImage = async (req, res) => {
  try {
    const { imageId } = req.params;

    const r = await pool.query(
      "SELECT c.user_id FROM company_images ci JOIN companies c ON ci.company_id = c.id WHERE ci.id = $1",
      [imageId]
    );
    if (!r.rows.length) return res.status(404).json({ message: "Slika ne postoji" });

    const { user_id } = r.rows[0];
    if (req.user.role !== "admin" && req.user.id !== user_id)
      return res.status(403).json({ message: "Nemate pravo da obrišete ovu sliku" });

    // ovde koristiš funkciju iz utils
    await deleteImageById(imageId);

    res.json({ success: true });
  } catch (err) {
    console.error("deleteCompanyImage error:", err);
    res.status(500).json({ message: "Greška pri brisanju slike", error: err.message });
  }
};

/* ================== COMPANIES ================== */
export const getAllCompanies = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, city FROM companies ORDER BY id');
    const companies = [];

    for (const company of result.rows) {
      const imagesRes = await pool.query(
        'SELECT id, image_path, public_id FROM company_images WHERE company_id=$1',
        [company.id]
      );

      const images = imagesRes.rows.map(img => ({ id: img.id, url: buildImageUrl(img) }));
      companies.push({ ...company, images });
    }

    res.json(companies);
  } catch (err) {
    console.error('getAllCompanies error:', err);
    res.status(500).json({ message: 'Greška pri dohvaćanju firmi', error: err.message });
  }
};

export const getAllCompaniesForUsers = async (req, res) => {
  try {
    const companiesRes = await pool.query('SELECT * FROM companies_with_ratings ORDER BY id DESC');
    const companies = [];

    for (const company of companiesRes.rows) {
      let services = company.services;
      if (typeof services === 'string') { try { services = JSON.parse(services); } catch { services = []; } }

      const imagesRes = await pool.query('SELECT * FROM company_images WHERE company_id=$1', [company.id]);
      const images = imagesRes.rows.length
        ? imagesRes.rows.map(img => ({
          ...img,
          url: img.public_id
            ? cloudinary.url(img.public_id)
            : `/uploads/companies/${img.image_path}`
        }))
        : [{ image_path: 'default.png', url: '/uploads/companies/default.png' }];

      const slotsRes = await pool.query(
        'SELECT * FROM slots WHERE company_id=$1 AND is_booked=false ORDER BY start_time ASC',
        [company.id]
      );

      const slots = slotsRes.rows.map(slot => ({
        ...slot,
        start_time: slot.start_time.toISOString(),
        end_time: slot.end_time?.toISOString() || null
      }));

      companies.push({
        ...company,
        services,
        images,
        slots,
        avg_rating: Number(company.avg_rating) || 0,
        review_count: Number(company.review_count) || 0
      });
    }

    res.json(companies);
  } catch (err) {
    console.error('getAllCompaniesForUsers error:', err);
    res.status(500).json({ message: 'Greška pri dohvaćanju firmi', error: err.message });
  }
};

export const getCompanyByUser = async (req, res) => {
  const userId = Number(req.params.userId || req.params.id);
  if (isNaN(userId)) return res.status(400).json({ message: 'Nevažeći user ID' });

  const r = await pool.query(
    'SELECT * FROM companies WHERE user_id=$1 ORDER BY id DESC LIMIT 1',
    [userId]
  );

  res.json(r.rows[0] || null);
};

export const getMyCompany = async (req, res) => {
  try {
    const companyRes = await pool.query(
      'SELECT * FROM companies WHERE user_id=$1 ORDER BY id DESC LIMIT 1',
      [Number(req.user.id)]
    );

    const company = companyRes.rows[0];
    if (!company) return res.json(null);

    const imagesRes = await pool.query(
      'SELECT id, image_path, public_id FROM company_images WHERE company_id=$1',
      [company.id]
    );

    let services = company.services;
    if (typeof services === 'string') { try { services = JSON.parse(services); } catch { services = []; } }

    const slotsRes = await pool.query('SELECT * FROM slots WHERE company_id=$1 ORDER BY start_time ASC', [company.id]);
    const slots = slotsRes.rows.map(slot => ({
      ...slot,
      start_time: slot.start_time.toISOString(),
      end_time: slot.end_time.toISOString()
    }));

    res.json({
      ...company,
      services,
      slots,
      images: imagesRes.rows.length
        ? imagesRes.rows.map(img => ({
          ...img,
          url: img.public_id
            ? cloudinary.url(img.public_id)
            : `/uploads/companies/${img.image_path}`
        }))
        : [{ id: null, url: '/uploads/companies/default.png' }]
    });
  } catch (err) {
    console.error('getMyCompany error:', err);
    res.status(500).json({ message: 'Greška pri dohvaćanju firme', error: err.message });
  }
};

/* ================== COMPANY DETAILS ================== */
export const getCompanyByIdWithDetails = async (req, res) => {
  const companyId = parseInt(req.params.id);
  if (isNaN(companyId)) return res.status(400).json({ message: "Nevažeći ID firme" });

  try {
    const companyRes = await pool.query('SELECT * FROM companies WHERE id=$1', [companyId]);
    const company = companyRes.rows[0];
    if (!company) return res.status(404).json({ message: "Firma nije pronađena" });

    let services = company.services;
    if (typeof services === 'string') { try { services = JSON.parse(services); } catch { services = []; } }

    const imagesRes = await pool.query(
      'SELECT id, image_path, public_id FROM company_images WHERE company_id=$1',
      [companyId]
    );

    const images = imagesRes.rows.length
      ? imagesRes.rows.map(img => ({
        id: img.id,
        url: img.public_id
          ? cloudinary.url(img.public_id)
          : `/uploads/companies/${img.image_path}`
      }))
      : [{ id: null, url: '/uploads/companies/default.png' }];

    const slotsRes = await pool.query('SELECT * FROM slots WHERE company_id=$1 ORDER BY start_time ASC', [company.id]);
    const slots = slotsRes.rows.map(slot => ({
      ...slot,
      start_time: slot.start_time.toISOString(),
      end_time: slot.end_time.toISOString()
    }));

    res.json({ ...company, services, images, slots });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Greška pri dohvaćanju firme" });
  }
};

/* ================== COMPANY BY CATEGORY & USER WITH DETAILS ================== */
export const getCompaniesByCategoryWithDetails = async (req, res) => {
  const categoryId = parseInt(req.params.id);
  if (isNaN(categoryId)) return res.status(400).json({ message: "Nevažeći ID kategorije" });

  try {
    const r = await pool.query(
      'SELECT * FROM companies WHERE category_id=$1 ORDER BY id DESC',
      [categoryId]
    );

    const companies = [];
    for (const company of r.rows) {
      let services = company.services;
      if (typeof services === 'string') { try { services = JSON.parse(services); } catch { services = []; } }

      const imagesRes = await pool.query(
        'SELECT id, image_path, public_id FROM company_images WHERE company_id=$1',
        [company.id]
      );
      const images = imagesRes.rows.length
        ? imagesRes.rows.map(img => ({
          id: img.id,
          url: img.public_id
            ? cloudinary.url(img.public_id)
            : `/uploads/companies/${img.image_path}`
        }))
        : [{ id: null, url: '/uploads/companies/default.png' }];

      const slotsRes = await pool.query(
        'SELECT * FROM slots WHERE company_id=$1 ORDER BY start_time ASC',
        [company.id]
      );
      const slots = slotsRes.rows.map(slot => ({
        ...slot,
        start_time: slot.start_time.toISOString(),
        end_time: slot.end_time?.toISOString() || null
      }));

      companies.push({ ...company, services, images, slots });
    }

    res.json(companies);
  } catch (err) {
    console.error("getCompaniesByCategoryWithDetails error:", err);
    res.status(500).json({ message: "Greška pri dohvaćanju firmi po kategoriji", error: err.message });
  }
};

export const getCompanyByUserWithDetails = async (req, res) => {
  const userId = parseInt(req.params.id);
  if (isNaN(userId)) return res.status(400).json({ message: "Nevažeći ID korisnika" });

  try {
    const r = await pool.query(
      'SELECT * FROM companies WHERE user_id=$1 ORDER BY id DESC LIMIT 1',
      [userId]
    );
    const company = r.rows[0];
    if (!company) return res.json(null);

    const imagesRes = await pool.query(
      'SELECT id, image_path, public_id FROM company_images WHERE company_id=$1',
      [company.id]
    );

    let services = company.services;
    if (typeof services === 'string') { try { services = JSON.parse(services); } catch { services = []; } }

    const slotsRes = await pool.query('SELECT * FROM slots WHERE company_id=$1 ORDER BY start_time ASC', [company.id]);
    const slots = slotsRes.rows.map(slot => ({
      ...slot,
      start_time: slot.start_time.toISOString(),
      end_time: slot.end_time?.toISOString() || null
    }));

    const images = imagesRes.rows.length
      ? imagesRes.rows.map(img => ({
        id: img.id,
        url: img.public_id
          ? cloudinary.url(img.public_id)
          : `/uploads/companies/${img.image_path}`
      }))
      : [{ id: null, url: '/uploads/companies/default.png' }];

    res.json({ ...company, services, images, slots });
  } catch (err) {
    console.error("getCompanyByUserWithDetails error:", err);
    res.status(500).json({ message: "Greška pri dohvaćanju firme korisnika", error: err.message });
  }
};

/* ================== ostatak file-a ostaje isti ================== */

export const getAllCompaniesWithDetails = async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM companies ORDER BY id DESC');

    const companies = [];
    for (const company of r.rows) {
      let services = company.services;
      if (typeof services === 'string') { try { services = JSON.parse(services); } catch { services = []; } }

      const imagesRes = await pool.query('SELECT * FROM company_images WHERE company_id=$1', [company.id]);
      const images = imagesRes.rows.map(img => ({
        ...img,
        url: img.public_id
          ? cloudinary.url(img.public_id)
          : `/uploads/companies/${img.image_path}`
      }));

      const slotsRes = await pool.query('SELECT * FROM slots WHERE company_id=$1 ORDER BY start_time ASC', [company.id]);
      const slots = slotsRes.rows.map(slot => ({
        ...slot,
        start_time: slot.start_time.toISOString(),
        end_time: slot.end_time?.toISOString() || null
      }));

      companies.push({ ...company, services, images, slots });
    }

    res.json(companies);
  } catch (err) {
    console.error("getAllCompaniesWithDetails error:", err);
    res.status(500).json({ message: "Greška pri dohvaćanju firmi sa detaljima", error: err.message });
  }
};

/* ================== COMPANY SERVICES ================== */
export const updateCompanyServices = async (req, res) => {
  const companyId = Number(req.params.id);
  let { services } = req.body;

  if (!Array.isArray(services))
    return res.status(400).json({ message: "services mora biti niz" });

  try {
    const savedServices = [];

    // 1️⃣ Insert ili update za svaki servis
    for (const s of services) {
      if (!s.id && s.tempId) {
        // novi servis
        const result = await pool.query(
          `INSERT INTO services (company_id, name, price, duration, category_id, temp_id)
           VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
          [companyId, s.name, s.price, s.duration ?? 60, s.category_id, s.tempId]
        );
        savedServices.push({ ...result.rows[0], tempId: s.tempId });
      } else if (s.id) {
        // update postojećeg
        const fields = [];
        const values = [];
        let i = 1;

        for (const key of ['name', 'price', 'duration', 'category_id']) {
          if (s[key] !== undefined) {
            fields.push(`${key}=$${i++}`);
            values.push(s[key]);
          }
        }
        if (!fields.length) continue;

        values.push(s.id);
        const r = await pool.query(
          `UPDATE services SET ${fields.join(', ')} WHERE id=$${i} RETURNING *`,
          values
        );
        if (r.rows.length) savedServices.push(r.rows[0]);
      }
    }

    // 2️⃣ Dohvati sve servise kompanije da ne nestanu ostali
    const allServicesRes = await pool.query(
      `SELECT * FROM services WHERE company_id=$1`,
      [companyId]
    );

    // 3️⃣ Ažuriraj kolonu services u companies
    await pool.query(
      `UPDATE companies SET services=$1 WHERE id=$2`,
      [JSON.stringify(allServicesRes.rows), companyId]
    );

    res.json({ services: allServicesRes.rows });
  } catch (err) {
    console.error("updateCompanyServices error:", err);
    res.status(500).json({ message: "Greška pri update-u servisa", error: err.message });
  }
};

/* ================== COMPANY CRUD ================== */
export const upsertCompany = async (req, res) => {
  try {
    const companyId = req.body.id ? parseInt(req.body.id, 10) : null;
    const userId = req.body.userId ? parseInt(req.body.userId, 10) : req.user.id;

    let services = [];
    if (req.body.services) services = typeof req.body.services === 'string' ? JSON.parse(req.body.services) : req.body.services;

    if (companyId) {
      const exists = await pool.query('SELECT id FROM companies WHERE id=$1', [companyId]);
      if (exists.rows.length) {
        const fields = [];
        const values = [];
        let i = 1;

        for (const key of ['name', 'city', 'description']) {
          if (req.body[key]) { fields.push(`${key}=$${i++}`); values.push(req.body[key]); }
        }
        if (services.length) { fields.push(`services=$${i++}`); values.push(JSON.stringify(services)); }
        if (!fields.length) return res.status(400).json({ message: 'Nema podataka za update' });

        values.push(companyId);
        const r = await pool.query(`UPDATE companies SET ${fields.join(', ')} WHERE id=$${i} RETURNING *`, values);
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

export const updateCompany = async (req, res) => {
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
      try { services = JSON.parse(services); } catch { return res.status(400).json({ message: 'Nevažeći format services' }); }
    }
    fields.push(`services=$${i++}`);
    values.push(JSON.stringify(services));
  }

  if (!fields.length) return res.status(400).json({ message: 'Nema podataka za update' });

  values.push(id);
  const r = await pool.query(`UPDATE companies SET ${fields.join(', ')} WHERE id=$${i} RETURNING *`, values);
  res.json(r.rows[0]);
};

export const deleteCompany = async (req, res) => {
  const id = Number(req.params.id);
  await pool.query('DELETE FROM companies WHERE id=$1', [id]);
  res.json({ message: 'Firma obrisana' });
};

/* ================== SLOTS ================== */
export const getCompanySlots = async (req, res) => {
  const companyId = parseInt(req.params.id);
  if (isNaN(companyId)) return res.status(400).json({ message: "Nevažeći ID firme" });

  try {
    const r = await pool.query(
      `SELECT * FROM slots WHERE company_id=$1 ORDER BY start_time ASC`,
      [companyId]
    );

    const slots = r.rows.map(slot => ({
      ...slot,
      start_time: slot.start_time.toISOString(),
      end_time: slot.end_time.toISOString()
    }));

    res.json({ slots });
  } catch (err) {
    console.error("getCompanySlots error:", err);
    res.status(500).json({ message: "Greška pri učitavanju termina", error: err.message });
  }
};

export const saveSlotsHandler = async (req, res) => {
  const companyId = parseInt(req.params.id);
  const slots = req.body.slots;

  if (isNaN(companyId)) return res.status(400).json({ message: "Nevažeći ID firme" });
  if (!Array.isArray(slots)) return res.status(400).json({ message: "slots mora biti niz" });

  try {
    const savedSlots = [];

    // 1️⃣ Dohvati sve usluge kompanije da validiraš service_id
    const servicesResult = await pool.query(
      `SELECT id, temp_id FROM services WHERE company_id=$1`,
      [companyId]
    );
    const serviceMap = {};
    for (const s of servicesResult.rows) {
      if (s.id) serviceMap[s.id] = s.id;
      if (s.temp_id) serviceMap[s.temp_id] = s.id;
    }

    for (const slot of slots) {
      let { id, service_id, tempServiceId, start_time, end_time } = slot;

      // 2️⃣ Ako nema service_id, koristi tempServiceId
      if (!service_id && tempServiceId && serviceMap[tempServiceId]) {
        service_id = serviceMap[tempServiceId];
      }

      // 3️⃣ Preskoči slot ako service_id nije validan
      if (!service_id || !serviceMap[service_id]) continue;
      if (!start_time || !end_time) continue;

      const start = new Date(start_time);
      const end = new Date(end_time);
      if (isNaN(start) || isNaN(end) || end <= start) continue;

      start_time = start.toISOString();
      end_time = end.toISOString();

      // 4️⃣ Insert ili update
      if (!id || (typeof id === "string" && id.startsWith("temp-"))) {
        const r = await pool.query(
          `INSERT INTO slots (company_id, service_id, start_time, end_time)
           VALUES ($1,$2,$3,$4) RETURNING *`,
          [companyId, service_id, start_time, end_time]
        );
        savedSlots.push(r.rows[0]);
      } else {
        const numericId = BigInt(id);
        const r = await pool.query(
          `UPDATE slots SET service_id=$1, start_time=$2, end_time=$3
           WHERE id=$4 AND company_id=$5 RETURNING *`,
          [service_id, start_time, end_time, numericId.toString(), companyId]
        );
        if (r.rows.length) savedSlots.push(r.rows[0]);
      }
    }

    // 5️⃣ Vraćamo sve slotove kompanije (da frontend uvek ima kompletan prikaz)
    const allSlotsRes = await pool.query(
      `SELECT * FROM slots WHERE company_id=$1 ORDER BY start_time ASC`,
      [companyId]
    );
    const allSlots = allSlotsRes.rows.map(slot => ({
      ...slot,
      start_time: slot.start_time.toISOString(),
      end_time: slot.end_time.toISOString()
    }));

    res.json({ slots: allSlots });
  } catch (err) {
    console.error("saveSlotsHandler error:", err);
    res.status(500).json({ message: "Greška pri čuvanju termina", error: err.message });
  }
};


export const deleteSlot = async (req, res) => {
  const companyId = parseInt(req.params.id);
  const slotId = parseInt(req.params.slotId);
  if (isNaN(companyId) || isNaN(slotId))
    return res.status(400).json({ message: "Nevažeći ID firme ili termina" });

  try {
    const r = await pool.query('SELECT * FROM slots WHERE id=$1 AND company_id=$2', [slotId, companyId]);
    if (!r.rows.length) return res.status(404).json({ message: "Termin nije pronađen" });

    await pool.query('DELETE FROM slots WHERE id=$1', [slotId]);
    res.json({ message: "Termin obrisan" });
  } catch (err) {
    console.error("deleteSlot error:", err);
    res.status(500).json({ message: "Greška pri brisanju termina", error: err.message });
  }
};

/* ================== SEARCH ================== */
export const searchCompanies = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') return res.status(400).json({ message: "Query param 'q' je obavezan" });

    const queryText = `
      SELECT * FROM companies_with_ratings
      WHERE LOWER(name) LIKE $1
         OR LOWER(city) LIKE $1
         OR LOWER(services::text) LIKE $1
      ORDER BY id DESC
    `;
    const searchTerm = `%${q.toLowerCase()}%`;
    const r = await pool.query(queryText, [searchTerm]);

    const companies = [];
    for (const company of r.rows) {
      let services = company.services;
      if (typeof services === 'string') {
        try { services = JSON.parse(services); } catch { services = []; }
      }

      const imagesRes = await pool.query('SELECT * FROM company_images WHERE company_id=$1', [company.id]);
      const images = imagesRes.rows.length
        ? imagesRes.rows.map(img => ({
          ...img,
          url: img.public_id
            ? `https://res.cloudinary.com/<tvoj-cloud-name>/image/upload/${img.public_id}`
            : `/uploads/companies/${img.image_path}`
        }))
        : [{ image_path: 'default.png', url: '/uploads/companies/default.png' }];

      companies.push({
        ...company,
        services,
        images,
        avg_rating: Number(company.avg_rating) || 0,
        review_count: Number(company.review_count) || 0
      });
    }

    res.json(companies);
  } catch (err) {
    console.error("searchCompanies error:", err);
    res.status(500).json({ message: "Greška pri pretrazi firmi", error: err.message });
  }
};
export default {
  // Companies
  getAllCompanies,
  getAllCompaniesForUsers,
  getCompanyByUser,
  getCompanyByIdWithDetails,
  getCompaniesByCategoryWithDetails,
  getCompanyByUserWithDetails,
  getAllCompaniesWithDetails,
  getMyCompany,
  searchCompanies,
  upsertCompany,
  updateCompany,
  deleteCompany,

  // Images
  uploadCompanyImages,
  getCompanyImages,
  deleteCompanyImage,

  // Services
  updateCompanyServices,

  // Slots
  getCompanySlots,
  saveSlotsHandler,
  deleteSlot
};

