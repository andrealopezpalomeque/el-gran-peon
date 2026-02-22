import { db } from '../config/firebase.js';

const promoCodesRef = db.collection('promoCodes');

export async function createPromoCode(req, res) {
  try {
    const { code, description, discountPercent, maxUses, maxUsesPerCustomer, expiresAt, isActive } = req.body;

    if (!code || !discountPercent) {
      return res.status(400).json({ error: 'Codigo y porcentaje de descuento son requeridos.' });
    }

    const normalizedCode = code.toUpperCase().trim();

    if (discountPercent < 1 || discountPercent > 100) {
      return res.status(400).json({ error: 'El porcentaje debe estar entre 1 y 100.' });
    }

    // Check uniqueness
    const existing = await promoCodesRef.where('code', '==', normalizedCode).get();
    if (!existing.empty) {
      return res.status(409).json({ error: 'Ya existe un codigo promocional con ese nombre.' });
    }

    const now = new Date();
    const data = {
      code: normalizedCode,
      description: description || '',
      discountPercent,
      maxUses: maxUses ?? 0,
      maxUsesPerCustomer: maxUsesPerCustomer ?? 0,
      currentUses: 0,
      usedBy: [],
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isActive: isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await promoCodesRef.add(data);
    res.status(201).json({ id: docRef.id, ...data });
  } catch (error) {
    console.error('Error creating promo code:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
}

export async function listPromoCodes(req, res) {
  try {
    const snapshot = await promoCodesRef.orderBy('createdAt', 'desc').get();
    const codes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(codes);
  } catch (error) {
    console.error('Error listing promo codes:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
}

export async function getPromoCode(req, res) {
  try {
    const doc = await promoCodesRef.doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Codigo promocional no encontrado.' });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error getting promo code:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
}

export async function updatePromoCode(req, res) {
  try {
    const doc = await promoCodesRef.doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Codigo promocional no encontrado.' });
    }

    const updates = { ...req.body, updatedAt: new Date() };
    delete updates.id;
    delete updates.createdAt;
    delete updates.currentUses;
    delete updates.usedBy;

    if (updates.code) {
      updates.code = updates.code.toUpperCase().trim();
      // Check uniqueness if code changed
      if (updates.code !== doc.data().code) {
        const existing = await promoCodesRef.where('code', '==', updates.code).get();
        if (!existing.empty) {
          return res.status(409).json({ error: 'Ya existe un codigo promocional con ese nombre.' });
        }
      }
    }

    if (updates.expiresAt) {
      updates.expiresAt = new Date(updates.expiresAt);
    }

    await promoCodesRef.doc(req.params.id).update(updates);
    const updated = await promoCodesRef.doc(req.params.id).get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (error) {
    console.error('Error updating promo code:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
}

export async function deletePromoCode(req, res) {
  try {
    const doc = await promoCodesRef.doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Codigo promocional no encontrado.' });
    }

    await promoCodesRef.doc(req.params.id).delete();
    res.json({ success: true, message: 'Codigo promocional eliminado.' });
  } catch (error) {
    console.error('Error deleting promo code:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
}

export async function validatePromoCode(req, res) {
  try {
    const { code, email } = req.body;

    if (!code) {
      return res.status(400).json({ valid: false, error: 'El codigo es requerido.' });
    }

    const normalizedCode = code.toUpperCase().trim();
    const snapshot = await promoCodesRef.where('code', '==', normalizedCode).get();

    if (snapshot.empty) {
      return res.json({ valid: false, error: 'Codigo no encontrado.' });
    }

    const doc = snapshot.docs[0];
    const promo = doc.data();

    if (!promo.isActive) {
      return res.json({ valid: false, error: 'Este codigo ya no esta activo.' });
    }

    // Check expiry
    if (promo.expiresAt) {
      const expiryDate = promo.expiresAt._seconds
        ? new Date(promo.expiresAt._seconds * 1000)
        : new Date(promo.expiresAt);
      if (expiryDate < new Date()) {
        return res.json({ valid: false, error: 'Este codigo ha expirado.' });
      }
    }

    // Check global usage limit
    if (promo.maxUses > 0 && promo.currentUses >= promo.maxUses) {
      return res.json({ valid: false, error: 'Este codigo alcanzo el limite de usos.' });
    }

    // Check per-customer usage limit
    if (email && promo.maxUsesPerCustomer > 0) {
      const normalizedEmail = email.toLowerCase().trim();
      const customerUses = (promo.usedBy || []).filter(u => u.email === normalizedEmail).length;
      if (customerUses >= promo.maxUsesPerCustomer) {
        return res.json({ valid: false, error: 'Ya usaste este codigo la cantidad maxima de veces.' });
      }
    }

    res.json({
      valid: true,
      code: promo.code,
      discountPercent: promo.discountPercent,
      promoCodeId: doc.id,
    });
  } catch (error) {
    console.error('Error validating promo code:', error);
    res.status(500).json({ valid: false, error: 'Error del servidor.' });
  }
}
