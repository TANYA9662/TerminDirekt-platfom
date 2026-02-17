import * as Category from '../models/Category.js';
import { pool } from '../config/db.js';


// GET /api/categories
export const getAllCategories = async (req, res) => {
  try {
    // uzimamo jezik iz query param ili header
    const lang = (req.query.lang || req.headers['accept-language'] || 'en').split("-")[0];

    const result = await pool.query(`
      SELECT c.id,
             c.name,
             jsonb_object_agg(t.lang_code, t.value) AS name_translations
      FROM categories c
      LEFT JOIN translations t
        ON t.row_id = c.id AND t.table_name = 'categories' AND t.column_name = 'name'
      GROUP BY c.id, c.name
    `);

    const categories = result.rows.map(c => ({
      ...c,
      name: c.name_translations?.[lang] || c.name
    }));

    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
export const getCategoryById = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "Nevažeći ID kategorije" });

  try {
    const result = await pool.query(`
      SELECT c.id,
             c.name,
             jsonb_object_agg(t.lang_code, t.value) AS name_translations
      FROM categories c
      LEFT JOIN translations t
        ON t.row_id = c.id AND t.table_name = 'categories' AND t.column_name = 'name'
      WHERE c.id = $1
      GROUP BY c.id, c.name
    `, [id]);

    if (result.rows.length === 0) return res.status(404).json({ message: "Kategorija nije pronađena" });

    const category = result.rows[0];

    res.json({
      ...category,
      name: category.name_translations?.[req.query.lang?.split('-')[0] || req.headers['accept-language']?.split('-')[0] || 'en'] || category.name
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Greška na serveru" });
  }
};



// POST /api/categories
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const newCategory = await Category.createCategory({ name });
    res.status(201).json(newCategory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Greška pri kreiranju kategorije' });
  }
};

// PUT /api/categories/:id
export const updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const updatedCategory = await Category.updateCategory(req.params.id, name);
    res.json(updatedCategory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Greška pri ažuriranju kategorije' });
  }
};

// DELETE /api/categories/:id
export const deleteCategory = async (req, res) => {
  try {
    await Category.deleteCategory(req.params.id);
    res.json({ message: 'Kategorija obrisana' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Greška pri brisanju kategorije' });
  }
};
//  GET getCompaniesByCategory
export const getCompaniesByCategory = async (req, res) => {
  const categoryId = parseInt(req.params.id);
  if (isNaN(categoryId)) return res.status(400).json({ message: "Nevažeći categoryId" });

  try {
    const companies = await Category.getCompaniesByCategory(categoryId);
    res.json(companies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Greška na serveru" });
  }
};

// GET /api/companies/user-view
export const getCompaniesByCategoryWithDetails = async (req, res) => {
  const categoryId = parseInt(req.params.id);
  if (isNaN(categoryId)) return res.status(400).json({ message: "Nevažeći categoryId" });

  try {
    const companies = await Category.getCompaniesByCategoryWithDetails(categoryId);
    res.json(companies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Greška na serveru" });
  }
};
