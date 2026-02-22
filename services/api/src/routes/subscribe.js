import { Router } from 'express';
import { db } from '../config/firebase.js';
import { requireAuth } from '../middleware/auth.js';
import { listSubscribers } from '../controllers/subscriberController.js';

const router = Router();

router.get('/', requireAuth, listSubscribers);

router.post('/', async (req, res) => {
  try {
    const { email, source } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({ error: 'El email es requerido.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'El email no es válido.' });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const subscribersRef = db.collection('subscribers');
    const existingQuery = await subscribersRef.where('email', '==', normalizedEmail).get();

    if (!existingQuery.empty) {
      return res.status(409).json({ error: 'Este email ya está registrado.' });
    }

    // Add new subscriber
    const docRef = await subscribersRef.add({
      email: normalizedEmail,
      createdAt: new Date(),
      source: source || 'landing-page',
    });

    console.log(`New subscriber: ${normalizedEmail} (${docRef.id})`);

    res.status(201).json({
      success: true,
      message: '¡Gracias por suscribirte!'
    });

  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ error: 'Error del servidor. Intentá de nuevo.' });
  }
});

export default router;
