import express from 'express';
import * as categoryController from '../controllers/categoryController.js';

const router = express.Router();

// List all categories
router.get('/', categoryController.getAllCategories);

// One category by ID
router.get('/:id', categoryController.getCategoryById);

// All companies in category
router.get('/:id/companies', categoryController.getCompaniesByCategory);
router.get("/:id/companies/details", categoryController.getCompaniesByCategoryWithDetails);


// CRUD
router.post('/', categoryController.createCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

export default router;
