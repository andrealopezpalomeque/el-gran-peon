import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  createPurchase,
  listPurchases,
  getPurchase,
  updatePurchase,
  deletePurchase,
} from '../controllers/purchaseController.js';

const router = Router();

router.get('/', requireAuth, listPurchases);
router.get('/:id', requireAuth, getPurchase);
router.post('/', requireAuth, createPurchase);
router.put('/:id', requireAuth, updatePurchase);
router.delete('/:id', requireAuth, deletePurchase);

export default router;
