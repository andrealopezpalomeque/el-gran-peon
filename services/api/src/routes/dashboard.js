import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getAnalytics } from '../controllers/dashboardController.js';

const router = Router();

router.get('/analytics', requireAuth, getAnalytics);

export default router;
