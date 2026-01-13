import * as Category from '../models/Category.js';
import pool from '../db/pool.js';

// GET /api/categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.getAllCategories();
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Greška pri učitavanju kategorija' });
  }
};

// GET /api/categories/:id
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.getCategoryById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Kategorija nije pronađena' });
    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Greška pri učitavanju kategorije' });
  }
};

// POST /api/categories
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const newCategory = await Category.createCategory(name);
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
