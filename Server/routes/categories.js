import express from 'express';
import * as categoryController from '../controllers/categoryController.js';

const router = express.Router();

// Lista svih kategorija
router.get('/', categoryController.getAllCategories);

// Jedna kategorija po ID-u
router.get('/:id', categoryController.getCategoryById);

// Sve firme u kategoriji
router.get('/:id/companies', categoryController.getCompaniesByCategory);
router.get("/:id/companies/details", categoryController.getCompaniesByCategoryWithDetails);


// CRUD
router.post('/', categoryController.createCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

export default router;
