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
