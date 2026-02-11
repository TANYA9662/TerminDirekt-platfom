import * as Provider from '../models/Provider.js';
import { pool } from '../config/db.js';

// GET /api/providers
export const getAllProviders = async (req, res) => {
  try {
    const providers = await Provider.getAllProviders();
    res.json(providers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Greška pri učitavanju provajdera' });
  }
};

// GET /api/providers/:id
export const getProviderById = async (req, res) => {
  try {
    const provider = await Provider.getProviderById(req.params.id);
    if (!provider) return res.status(404).json({ message: 'Provajder nije pronađen' });
    res.json(provider);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Greška pri učitavanju provajdera' });
  }
};

// POST /api/providers
export const createProvider = async (req, res) => {
  try {
    const { name, company_id, description, city, rating } = req.body;
    const newProvider = await Provider.createProvider({ name, company_id, description, city, rating });
    res.status(201).json(newProvider);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Greška pri kreiranju provajdera' });
  }
};

// PUT /api/providers/:id
export const updateProvider = async (req, res) => {
  try {
    const updatedProvider = await Provider.updateProvider(req.params.id, req.body);
    res.json(updatedProvider);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Greška pri ažuriranju provajdera' });
  }
};

// DELETE /api/providers/:id
export const deleteProvider = async (req, res) => {
  try {
    await Provider.deleteProvider(req.params.id);
    res.json({ message: 'Provajder obrisan' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Greška pri brisanju provajdera' });
  }
};
