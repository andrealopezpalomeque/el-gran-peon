import { Router } from 'express';
import { db } from '../config/firebase.js';
import { requireAuth } from '../middleware/auth.js';
import { listSubscribers, markAsContacted, bulkMarkAsContacted } from '../controllers/subscriberController.js';

const router = Router();

router.get('/', requireAuth, listSubscribers);
router.patch('/:id/contact', requireAuth, markAsContacted);
router.post('/bulk-contact', requireAuth, bulkMarkAsContacted);

router.post('/', async (req, res) => {
  try {
    const { email, source, nombre, telefono, empresa } = req.body;

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
      // For mayoristas source, update existing record with new fields
      if (source === 'mayoristas') {
        const existingDoc = existingQuery.docs[0];
        const updateData = { source: 'mayoristas' };
        if (nombre) updateData.nombre = nombre.trim();
        if (telefono) updateData.telefono = telefono.trim();
        if (empresa) updateData.empresa = empresa.trim();
        await existingDoc.ref.update(updateData);
        console.log(`Updated subscriber to mayorista: ${normalizedEmail}`);
        return res.status(200).json({
          success: true,
          message: '¡Registro mayorista actualizado!'
        });
      }
      return res.status(409).json({ error: 'Este email ya está registrado.' });
    }

    // Build subscriber data
    const data = {
      email: normalizedEmail,
      createdAt: new Date(),
      source: source || 'landing-page',
    };
    if (nombre) data.nombre = nombre.trim();
    if (telefono) data.telefono = telefono.trim();
    if (empresa) data.empresa = empresa.trim();

    const docRef = await subscribersRef.add(data);

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
