import pool from '../db/pool.js';
import fs from 'fs';
import path from 'path';

/* ================== IMAGES ================== */
export const uploadCompanyImages = async (req, res) => {
  try {
    const companyId = Number(req.params.id); // ID iz URL-a
    if (isNaN(companyId)) return res.status(400).json({ message: 'Nevažeći ID firme' });

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Nema fajlova' });
    }

    const saved = [];
    for (const file of req.files) {
      const relPath = file.filename; // ili path.basename(file.path) ako koristiš original path
      const r = await pool.query(
        'INSERT INTO company_images (company_id, image_path) VALUES ($1,$2) RETURNING *',
        [companyId, relPath] // ✅ koristi companyId, ne company.id
      );
      saved.push({ ...r.rows[0], url: `/uploads/companies/${r.rows[0].image_path}` });
    }

    res.status(201).json({ images: saved });
  } catch (err) {
    console.error('uploadCompanyImages error:', err);
    res.status(500).json({ message: 'Greška pri uploadu slika', error: err.message });
  }
};


const getCompanyImages = async (req, res) => {
  const id = Number(req.params.id);
  const r = await pool.query(
    'SELECT * FROM company_images WHERE company_id=$1',
    [id]
  );

  const imagesWithUrl = r.rows.map(img => {
    const fileName = path.basename(img.image_path);
    return { ...img, url: `/uploads/companies/${fileName}` };
  });

  res.json(imagesWithUrl);
};
const deleteCompanyImage = async (req, res) => {
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

    const filePath = path.join(process.cwd(), "public", "uploads", "companies", image.image_path);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await pool.query('DELETE FROM company_images WHERE id=$1', [imageId]);
    res.json({ message: 'Slika obrisana' });
  } catch (err) {
    console.error('Delete image error:', err);
    res.status(500).json({ message: 'Greška pri brisanju slike' });
  }
};
/* ================== GET ================== */
export const getAllCompanies = async (req, res, next) => {
  try {
    const result = await req.pool.query(
      "SELECT id, name, city FROM companies ORDER BY id"
    );

    const companies = [];

    for (const company of result.rows) {
      // Fetch images iz company_images
      const imagesRes = await req.pool.query(
        'SELECT image_path FROM company_images WHERE company_id=$1',
        [company.id]
      );

      const images = imagesRes.rows.length > 0
        ? imagesRes.rows.map(img => ({
          image_path: img.image_path,
          url: `/uploads/companies/${img.image_path}`
        }))
        : [{ image_path: 'default.png', url: '/uploads/companies/default.png' }];

      companies.push({
        ...company,
        images
      });
    }

    res.json(companies);
  } catch (err) {
    next(err);
  }
};

export const getAllCompaniesForUsers = async (_, res) => {
  try {
    const companiesRes = await pool.query('SELECT * FROM companies ORDER BY id DESC');
    const companies = [];

    for (const company of companiesRes.rows) {
      // services
      let services = company.services;
      if (typeof services === 'string') {
        try { services = JSON.parse(services); } catch { services = []; }
      }

      // images
      const imagesRes = await pool.query(
        'SELECT image_path FROM company_images WHERE company_id=$1',
        [company.id]
      );

      const images = imagesRes.rows.map(img => ({
        image_path: img.image_path,
        url: `/uploads/companies/${img.image_path}`
      }));

      // ✅ SLOTS (KLJUČNO)
      const slotsRes = await pool.query(
        `SELECT *
         FROM slots
         WHERE company_id=$1
           AND is_booked = false
         ORDER BY start_time ASC`,
        [company.id]
      );

      const slots = slotsRes.rows.map(slot => ({
        ...slot,
        start_time: slot.start_time.toISOString(),
        end_time: slot.end_time.toISOString()
      }));

      companies.push({
        ...company,
        services,
        images,
        slots
      });
    }

    res.json(companies);
  } catch (err) {
    console.error('getAllCompaniesForUsers error:', err);
    res.status(500).json({ message: 'Greška pri dohvaćanju firmi' });
  }
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
const getMyCompany = async (req, res) => {
  try {
    const companyRes = await pool.query(
      'SELECT * FROM companies WHERE user_id = $1 ORDER BY id DESC LIMIT 1',
      [Number(req.user.id)]
    );

    const company = companyRes.rows[0];
    if (!company) return res.json(null);

    const imagesRes = await pool.query(
      'SELECT id, image_path FROM company_images WHERE company_id = $1',
      [company.id]
    );

    let services = company.services;
    if (typeof services === 'string') {
      try {
        services = JSON.parse(services);
      } catch {
        services = [];
      }
    }

    res.json({
      ...company,
      services,
      images: imagesRes.rows.map(img => ({
        ...img,
        url: `/uploads/companies/${img.image_path}`
      }))
    });
  } catch (err) {
    console.error('getMyCompany error:', err);
    res.status(500).json({
      message: 'Greška pri dohvaćanju firme',
      error: err.message
    });
  }
};

export const getCompanyByUserWithDetails = async (req, res) => {
  const userId = Number(req.params.id);
  if (isNaN(userId)) return res.status(400).json({ message: "Nevažeći user ID" });

  try {
    const companyRes = await pool.query(
      'SELECT * FROM companies WHERE user_id=$1 ORDER BY id DESC LIMIT 1',
      [userId]
    );
    const company = companyRes.rows[0];
    if (!company) return res.status(404).json({ message: "Firma nije pronađena" });

    // slike
    const imagesRes = await pool.query(
      'SELECT id, image_path FROM company_images WHERE company_id=$1',
      [company.id]
    );
    const images = imagesRes.rows.map(img => ({
      ...img,
      url: `/uploads/companies/${img.image_path}`
    }));

    // services
    let services = company.services;
    if (typeof services === 'string') {
      try { services = JSON.parse(services); } catch { services = []; }
    }

    // slots
    const slotsRes = await pool.query(
      'SELECT * FROM slots WHERE company_id=$1 ORDER BY start_time ASC',
      [company.id]
    );
    const slots = slotsRes.rows.map(slot => ({
      ...slot,
      start_time: slot.start_time.toISOString(),
      end_time: slot.end_time.toISOString()
    }));

    res.json({ ...company, images, services, slots });
  } catch (err) {
    console.error("getCompanyByUserWithDetails error:", err);
    res.status(500).json({ message: "Greška pri dohvaćanju firme" });
  }
};



/* ================== GET ALL COMPANIES WITH FULL DETAILS ================== */
export const getAllCompaniesWithDetails = async (_, res) => {
  try {
    const companiesRes = await pool.query('SELECT * FROM companies ORDER BY id DESC');
    const companies = [];

    for (const company of companiesRes.rows) {
      // Services
      let services = company.services;
      if (typeof services === 'string') {
        try { services = JSON.parse(services); } catch { services = []; }
      }

      // Images
      const imagesRes = await pool.query('SELECT * FROM company_images WHERE company_id=$1', [company.id]);
      const images = imagesRes.rows.length
        ? imagesRes.rows.map(img => ({ ...img, url: `/uploads/companies/${img.image_path}` }))
        : [{ image_path: 'default.png', url: `/uploads/companies/default.png` }];

      // Slots
      const slotsRes = await pool.query('SELECT * FROM slots WHERE company_id=$1 ORDER BY start_time ASC', [company.id]);
      const slots = slotsRes.rows.map(slot => ({
        ...slot,
        start_time: slot.start_time.toISOString(),
        end_time: slot.end_time.toISOString()
      }));

      companies.push({
        ...company,
        services,
        images,
        slots
      });
    }

    res.json(companies);
  } catch (err) {
    console.error('getAllCompaniesWithDetails error:', err);
    res.status(500).json({ message: 'Greška pri dohvaćanju firmi', error: err.message });
  }
};

const getCompaniesByCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM companies WHERE category_id = $1",
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Greška pri učitavanju firmi" });
  }
};

// GET /api/categories/:id/companies/details
export const getCompaniesByCategoryWithDetails = async (req, res) => {
  const categoryId = parseInt(req.params.id);
  if (isNaN(categoryId)) return res.status(400).json({ message: "Nevažeći categoryId" });

  try {
    const result = await pool.query(
      `
      SELECT c.id, c.name, c.city, c.description,
        json_agg(
          DISTINCT jsonb_build_object(
            'id', s.id,
            'name', s.name,
            'price', s.price,
            'duration', s.duration
          )
        ) FILTER (WHERE s.id IS NOT NULL) AS services,
        json_agg(
          DISTINCT jsonb_build_object(
            'id', sl.id,
            'start_time', sl.start_time,
            'end_time', sl.end_time,
            'is_booked', sl.is_booked
          )
        ) FILTER (WHERE sl.id IS NOT NULL) AS slots,
        json_agg(
          DISTINCT jsonb_build_object(
            'id', img.id,
            'url', img.url
          )
        ) FILTER (WHERE img.id IS NOT NULL) AS images
      FROM companies c
      JOIN company_categories cc ON cc.company_id = c.id
      LEFT JOIN services s ON s.company_id = c.id
      LEFT JOIN slots sl ON sl.company_id = c.id
      LEFT JOIN company_images img ON img.company_id = c.id
      WHERE cc.category_id = $1
      GROUP BY c.id
      ORDER BY c.name ASC
      `,
      [categoryId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Greška na serveru" });
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

export const updateCompanyServices = async (req, res) => {
  const companyId = parseInt(req.params.id);
  console.log("Request body for updating services:", req.body);
  console.log("Authenticated user:", req.user);

  let services = req.body.services;

  // Ako nije prosleđeno, postavi na prazan niz
  if (!services) services = [];

  // Ako je broj ili string → pretvori u niz sa jednim objektom
  if (typeof services === "number" || typeof services === "string") {
    services = [{ id: null, name: req.body.name || "Usluga", price: Number(req.body.price) || 0 }];
  }

  // Ako je objekat → stavi u niz
  if (!Array.isArray(services)) {
    services = [services];
  }

  try {
    const savedServices = [];

    for (let s of services) {
      // Novi servis
      if (!s.id) {
        const newService = await pool.query(
          'INSERT INTO services (company_id, name, price, duration) VALUES ($1,$2,$3,$4) RETURNING *',
          [companyId, s.name, s.price, s.duration ?? 60]
        );
        savedServices.push({ ...newService.rows[0], tempId: s.tempId });
      } else {
        // Postojeći servis → samo dodaj u odgovor
        savedServices.push(s);
      }
    }

    // Sačuvaj u koloni companies
    await pool.query(
      'UPDATE companies SET services=$1 WHERE id=$2',
      [JSON.stringify(savedServices), companyId]
    );

    res.json({ services: savedServices });
  } catch (err) {
    console.error("updateCompanyServices error:", err);
    res.status(500).json({ message: "Greška pri update-u servisa", error: err.message });
  }
};
/* ================== DELETE ================== */
const deleteCompany = async (req, res) => {
  const id = Number(req.params.id);
  await pool.query('DELETE FROM companies WHERE id=$1', [id]);
  res.json({ message: 'Firma obrisana' });
};

// GET /api/companies/:id/slots
const getCompanySlots = async (req, res) => {
  const companyId = parseInt(req.params.id);
  if (isNaN(companyId)) {
    return res.status(400).json({ message: "Nevažeći ID firme" });
  }

  try {
    const r = await pool.query(
      `SELECT s.*, 
              s.start_time::text AS start_time_text,
              s.end_time::text AS end_time_text
       FROM slots s
       WHERE s.company_id = $1
       ORDER BY s.start_time ASC`,
      [companyId]
    );

    // Mapiranje da frontend dobije start_time i end_time u ISO formatu
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
/**
 * Save or update slots (termini) for a company
 * @param {number} companyId
 * @param {Array} slots - niz slot objekata sa: id, service_id, start_time, end_time
 * @returns {Array} savedSlots
 */
const saveSlotsToBackend = async (companyId, slots) => {
  if (!Array.isArray(slots)) throw new Error("slots mora biti niz");

  const savedSlots = [];

  for (const slot of slots) {
    const { id, service_id, start_time, end_time } = slot;

    if (!service_id || !start_time || !end_time) continue; // preskoči nevalidne

    // Novi termin - INSERT
    if (!id || String(id).startsWith("temp-")) {
      const result = await pool.query(
        `INSERT INTO slots (company_id, service_id, start_time, end_time)
         VALUES ($1, $2, $3, $4)
         RETURNING id, company_id, service_id, start_time, end_time, is_booked`,
        [companyId, service_id, start_time, end_time]
      );
      savedSlots.push(result.rows[0]);
    }
    // Postojeći termin - UPDATE
    else {
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) continue; // sigurnosna provera

      const result = await pool.query(
        `UPDATE slots
         SET service_id = $1, start_time = $2, end_time = $3
         WHERE id = $4 AND company_id = $5
         RETURNING id, company_id, service_id, start_time, end_time, is_booked`,
        [service_id, start_time, end_time, numericId, companyId]
      );

      if (result.rows.length) savedSlots.push(result.rows[0]);
    }
  }

  return savedSlots;
};
/**
 * Express handler za update slotova (ruta PUT /:id/slots)
 */
export const saveSlotsHandler = async (req, res) => {
  const companyId = parseInt(req.params.id);
  const slots = req.body.slots;

  console.log("saveSlotsHandler input:", { companyId, slots }); // <<< LOG INPUTA
  console.log("Authenticated user:", req.user);                 // <<< LOG USERA

  if (isNaN(companyId)) return res.status(400).json({ message: "Nevažeći ID firme" });
  if (!Array.isArray(slots)) return res.status(400).json({ message: "slots mora biti niz" });

  try {
    const savedSlots = [];

    for (const slot of slots) {
      let { id, service_id, start_time, end_time } = slot;
      console.log("processing slot:", slot); // <<< LOG SVAKOG SLOT-A

      if (!service_id || !start_time || !end_time) continue;

      const start = new Date(start_time);
      const end = new Date(end_time);
      if (isNaN(start) || isNaN(end)) continue;

      start_time = start.toISOString();
      end_time = end.toISOString();

      const isTemp = !id || (typeof id === "string" && id.startsWith("temp-"));

      if (isTemp) {
        const result = await pool.query(
          `INSERT INTO slots (company_id, service_id, start_time, end_time)
           VALUES ($1,$2,$3,$4)
           RETURNING id, company_id, service_id, start_time, end_time, is_booked`,
          [companyId, service_id, start_time, end_time]
        );
        savedSlots.push(result.rows[0]);
        continue;
      }

      const numericId = BigInt(id);
      const result = await pool.query(
        `UPDATE slots
         SET service_id=$1, start_time=$2, end_time=$3
         WHERE id=$4 AND company_id=$5
         RETURNING id, company_id, service_id, start_time, end_time, is_booked`,
        [service_id, start_time, end_time, numericId.toString(), companyId]
      );

      if (result.rows.length) savedSlots.push(result.rows[0]);
    }

    console.log("Saved slots:", savedSlots);  // <<< LOG SPREMNJENIH SLOTOVA
    res.json({ slots: savedSlots });
  } catch (err) {
    console.error("saveSlotsHandler error:", err); // <<< LOG GREŠKE
    res.status(500).json({ message: "Greška pri čuvanju termina", error: err.message });
  }
};

const deleteSlot = async (req, res) => {
  const companyId = parseInt(req.params.id);
  const slotId = parseInt(req.params.slotId);

  if (isNaN(companyId) || isNaN(slotId))
    return res.status(400).json({ message: "Nevažeći ID firme ili termina" });

  try {
    // opcionalno: proveri da li slot pripada kompaniji
    const r = await pool.query('SELECT * FROM slots WHERE id=$1 AND company_id=$2', [slotId, companyId]);
    if (!r.rows.length) return res.status(404).json({ message: "Termin nije pronađen" });

    await pool.query('DELETE FROM slots WHERE id=$1', [slotId]);
    res.json({ message: "Termin obrisan" });
  } catch (err) {
    console.error("deleteSlot error:", err);
    res.status(500).json({ message: "Greška pri brisanju termina", error: err.message });
  }
};

export default {
  getAllCompanies,
  getAllCompaniesForUsers,
  getCompanyByUser,
  getCompanyByUserWithDetails,
  getCompanyImages,
  getMyCompany,
  getCompanySlots,
  getAllCompaniesWithDetails,
  getCompaniesByCategory,
  getCompaniesByCategoryWithDetails,
  searchCompanies,
  deleteCompany,
  deleteCompanyImage,
  uploadCompanyImages,
  upsertCompany,
  updateCompany,
  updateCompanyServices,
  saveSlotsHandler,
  deleteSlot
};