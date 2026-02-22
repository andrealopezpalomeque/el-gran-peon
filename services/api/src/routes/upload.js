import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  uploadProductImage,
  uploadCategoryImage,
  uploadCustomerLogo,
  deleteImage,
} from '../controllers/uploadController.js';

const router = Router();

router.post('/product-image', requireAuth, ...uploadProductImage);
router.delete('/product-image', requireAuth, deleteImage);
router.post('/category-image', requireAuth, ...uploadCategoryImage);
router.post('/customer-logo', ...uploadCustomerLogo);

export default router;
