import express from 'express';
import * as slotController from '../controllers/slotController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', slotController.getAllSlots);
router.get('/:id', slotController.getSlotById);
router.post('/', authenticateToken, slotController.createSlot);
router.put('/:id', authenticateToken, slotController.updateSlot);
router.delete('/:id', authenticateToken, slotController.deleteSlot);

export default router;
