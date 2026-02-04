import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  createOrder,
  listOrders,
  getOrder,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
} from '../controllers/orderController.js';

const router = Router();

router.post('/', createOrder);
router.get('/', requireAuth, listOrders);
router.get('/:id', requireAuth, getOrder);
router.put('/:id', requireAuth, updateOrder);
router.patch('/:id/status', requireAuth, updateOrderStatus);
router.delete('/:id', requireAuth, deleteOrder);

export default router;
