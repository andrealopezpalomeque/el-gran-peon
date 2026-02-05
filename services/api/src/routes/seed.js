import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { seedCategories } from '../controllers/seedController.js';

const router = Router();

router.post('/categories', requireAuth, seedCategories);

export default router;
