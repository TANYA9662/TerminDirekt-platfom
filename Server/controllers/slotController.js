import * as Slot from '../models/Slot.js';

// GET /api/slots
export const getAllSlots = async (req, res) => {
  try {
    const slots = await Slot.getAllSlots();
    res.json(slots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Greška pri učitavanju termina' });
  }
};

// GET /api/slots/:id
export const getSlotById = async (req, res) => {
  try {
    const slot = await Slot.getSlotById(req.params.id);
    if (!slot) return res.status(404).json({ message: 'Termin nije pronađen' });
    res.json(slot);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Greška pri učitavanju termina' });
  }
};

// POST /api/slots
export const createSlot = async (req, res) => {
  try {
    const { provider_id, start_time, end_time, is_booked } = req.body;
    const newSlot = await Slot.createSlot({ provider_id, start_time, end_time, is_booked });
    res.status(201).json(newSlot);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Greška pri kreiranju termina' });
  }
};

// PUT /api/slots/:id
export const updateSlot = async (req, res) => {
  try {
    const updatedSlot = await Slot.updateSlot(req.params.id, req.body);
    res.json(updatedSlot);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Greška pri ažuriranju termina' });
  }
};

// DELETE /api/slots/:id
export const deleteSlot = async (req, res) => {
  try {
    await Slot.deleteSlot(req.params.id);
    res.json({ message: 'Termin obrisan' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Greška pri brisanju termina' });
  }
};
