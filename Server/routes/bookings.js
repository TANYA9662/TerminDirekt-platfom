import express from 'express';
import * as bookingController from '../controllers/bookingController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

/* ===== USER ===== */
router.get('/me', authenticateToken, bookingController.getMyBookings);
router.get('/company/me', authenticateToken, bookingController.getMyCompanyBookings);

/* ===== CREATE BOOKING ===== */
router.post('/', authenticateToken, bookingController.createBooking);

/* ===== ADMIN / PUBLIC ===== */
router.get('/', authenticateToken, bookingController.getAllBookings);
router.get('/:id', authenticateToken, bookingController.getBookingById);
router.put('/:id', authenticateToken, bookingController.updateBookingStatus);
router.delete('/:id', authenticateToken, bookingController.deleteBooking);

export default router;
