import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  listActiveProducts,
  listAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';

const router = Router();

router.get('/', listActiveProducts);
router.get('/all', requireAuth, listAllProducts);
router.get('/:idOrSlug', getProduct);
router.post('/', requireAuth, createProduct);
router.put('/:id', requireAuth, updateProduct);
router.delete('/:id', requireAuth, deleteProduct);

export default router;
