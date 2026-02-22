import { db } from '../config/firebase.js';

const subscribersRef = db.collection('subscribers');

export async function listSubscribers(req, res) {
  try {
    const snapshot = await subscribersRef.orderBy('createdAt', 'desc').get();
    const subscribers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(subscribers);
  } catch (error) {
    console.error('Error listing subscribers:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
}

export async function markAsContacted(req, res) {
  try {
    const { id } = req.params;
    const { channel, promoCodeSent, promoCodeId, contactedAt, note } = req.body;

    if (!channel || !['email', 'whatsapp'].includes(channel)) {
      return res.status(400).json({ error: 'Canal invalido. Debe ser "email" o "whatsapp".' });
    }

    const docRef = subscribersRef.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Suscriptor no encontrado.' });
    }

    const existing = doc.data();
    const now = new Date();
    const communicationEntry = {
      contactedAt: contactedAt ? new Date(contactedAt) : now,
      channel,
      promoCodeSent: promoCodeSent || null,
      promoCodeId: promoCodeId || null,
      note: note || '',
    };

    const communications = [...(existing.communications || []), communicationEntry];

    await docRef.update({
      communications,
      lastContactedAt: communicationEntry.contactedAt,
      updatedAt: now,
    });

    const updated = await docRef.get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (error) {
    console.error('Error marking subscriber as contacted:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
}

export async function bulkMarkAsContacted(req, res) {
  try {
    const { subscriberIds, channel, promoCodeSent, promoCodeId, contactedAt, note } = req.body;

    if (!subscriberIds || !Array.isArray(subscriberIds) || subscriberIds.length === 0) {
      return res.status(400).json({ error: 'Se requiere al menos un suscriptor.' });
    }

    if (!channel || !['email', 'whatsapp'].includes(channel)) {
      return res.status(400).json({ error: 'Canal invalido. Debe ser "email" o "whatsapp".' });
    }

    const now = new Date();
    const communicationEntry = {
      contactedAt: contactedAt ? new Date(contactedAt) : now,
      channel,
      promoCodeSent: promoCodeSent || null,
      promoCodeId: promoCodeId || null,
      note: note || '',
    };

    const batch = db.batch();
    let count = 0;

    for (const id of subscriberIds) {
      const docRef = subscribersRef.doc(id);
      const doc = await docRef.get();
      if (!doc.exists) continue;

      const existing = doc.data();
      const communications = [...(existing.communications || []), communicationEntry];

      batch.update(docRef, {
        communications,
        lastContactedAt: communicationEntry.contactedAt,
        updatedAt: now,
      });
      count++;
    }

    await batch.commit();

    res.json({ success: true, updated: count, message: `${count} suscriptores actualizados.` });
  } catch (error) {
    console.error('Error bulk marking subscribers as contacted:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
}
