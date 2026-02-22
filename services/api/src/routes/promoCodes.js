import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  createPromoCode,
  listPromoCodes,
  getPromoCode,
  updatePromoCode,
  deletePromoCode,
  validatePromoCode,
} from '../controllers/promoCodeController.js';

const router = Router();

// Public
router.post('/validate', validatePromoCode);

// Protected
router.post('/', requireAuth, createPromoCode);
router.get('/', requireAuth, listPromoCodes);
router.get('/:id', requireAuth, getPromoCode);
router.put('/:id', requireAuth, updatePromoCode);
router.delete('/:id', requireAuth, deletePromoCode);

export default router;
