import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  listActiveCategories,
  listAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';

const router = Router();

router.get('/', listActiveCategories);
router.get('/all', requireAuth, listAllCategories);
router.get('/:id', getCategory);
router.post('/', requireAuth, createCategory);
router.put('/:id', requireAuth, updateCategory);
router.delete('/:id', requireAuth, deleteCategory);

export default router;
