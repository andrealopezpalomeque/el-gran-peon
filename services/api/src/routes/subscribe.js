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
    const { email, source, nombre, telefono, empresa, nombreRazonSocial, contactType, contactValue } = req.body;

    const subscribersRef = db.collection('subscribers');
    const registrationSources = ['mayoristas', 'empresariales'];
    const isRegistration = registrationSources.includes(source);

    // Registration flow (mayoristas / empresariales)
    if (isRegistration) {
      if (!nombreRazonSocial || !contactType || !contactValue) {
        return res.status(400).json({ error: 'Nombre/Razón Social y método de contacto son requeridos.' });
      }

      if (!['email', 'telefono'].includes(contactType)) {
        return res.status(400).json({ error: 'Tipo de contacto inválido.' });
      }

      const trimmedValue = contactValue.trim();

      if (contactType === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedValue)) {
          return res.status(400).json({ error: 'El email no es válido.' });
        }
      }

      const normalizedValue = contactType === 'email' ? trimmedValue.toLowerCase() : trimmedValue;
      const field = contactType === 'email' ? 'email' : 'telefono';
      const existingQuery = await subscribersRef.where(field, '==', normalizedValue).get();

      if (!existingQuery.empty) {
        const existingDoc = existingQuery.docs[0];
        const updateData = {
          source,
          nombreRazonSocial: nombreRazonSocial.trim(),
          contactType,
        };
        if (contactType === 'email') updateData.email = normalizedValue;
        if (contactType === 'telefono') updateData.telefono = normalizedValue;
        await existingDoc.ref.update(updateData);
        console.log(`Updated subscriber to ${source}: ${normalizedValue}`);
        return res.status(200).json({ success: true, message: '¡Registro actualizado!' });
      }

      const data = {
        nombreRazonSocial: nombreRazonSocial.trim(),
        contactType,
        createdAt: new Date(),
        source,
      };
      if (contactType === 'email') data.email = normalizedValue;
      if (contactType === 'telefono') data.telefono = normalizedValue;

      const docRef = await subscribersRef.add(data);
      console.log(`New ${source} subscriber: ${normalizedValue} (${docRef.id})`);
      return res.status(201).json({ success: true, message: '¡Registro exitoso!' });
    }

    // Landing-page flow (email only)
    if (!email) {
      return res.status(400).json({ error: 'El email es requerido.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'El email no es válido.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingQuery = await subscribersRef.where('email', '==', normalizedEmail).get();

    if (!existingQuery.empty) {
      return res.status(409).json({ error: 'Este email ya está registrado.' });
    }

    const data = {
      email: normalizedEmail,
      createdAt: new Date(),
      source: source || 'landing-page',
    };

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
