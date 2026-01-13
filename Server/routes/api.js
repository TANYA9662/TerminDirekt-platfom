import express from 'express';
import authRoutes from './auth.js';
import companyRoutes from './companies.js';
import bookingsRoutes from './bookings.js';
import slotsRoutes from './slots.js';
import categoriesRoutes from './categories.js';
import providersRoutes from './providers.js';
import searchRoutes from './search.js';
import servicesRoutes from './services.js';

const router = express.Router();

// Samo postojeće rute
router.use('/auth', authRoutes);
router.use('/companies', companyRoutes);
router.use('/bookings', bookingsRoutes);
router.use('/slots', slotsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/providers', providersRoutes);
router.use('/search', searchRoutes);
router.use('/services', servicesRoutes);

export default router;
