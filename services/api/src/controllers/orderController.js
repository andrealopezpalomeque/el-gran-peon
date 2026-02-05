import { db } from '../config/firebase.js';

const ordersRef = db.collection('orders');
const countersRef = db.collection('counters');

async function getNextOrderNumber() {
  const counterDoc = countersRef.doc('orders');
  const result = await db.runTransaction(async (t) => {
    const doc = await t.get(counterDoc);
    const current = doc.exists ? doc.data().last : 0;
    const next = current + 1;
    t.set(counterDoc, { last: next });
    return next;
  });
  return `EGP-${String(result).padStart(4, '0')}`;
}

export async function createOrder(req, res) {
  try {
    const { customer, items, source } = req.body;

    if (!customer || !customer.name || !customer.phone) {
      return res.status(400).json({ error: 'Nombre y teléfono del cliente son requeridos.' });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'El pedido debe tener al menos un producto.' });
    }

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
    const orderNumber = await getNextOrderNumber();
    const now = new Date();

    const data = {
      orderNumber,
      customer: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
        address: customer.address || '',
        city: customer.city || '',
        province: customer.province || '',
        notes: customer.notes || '',
      },
      items,
      totalItems,
      totalAmount,
      adjustedAmount: totalAmount,
      status: 'nuevo',
      adminNotes: '',
      whatsappSent: false,
      source: source || 'storefront',
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await ordersRef.add(data);
    res.status(201).json({ id: docRef.id, ...data });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
}

export async function listOrders(req, res) {
  try {
    let query = ordersRef.orderBy('createdAt', req.query.sort === 'asc' ? 'asc' : 'desc');

    const snapshot = await query.get();
    let orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Filter by status in-memory (Firestore requires composite index for orderBy + where)
    if (req.query.status) {
      orders = orders.filter(o => o.status === req.query.status);
    }

    res.json(orders);
  } catch (error) {
    console.error('Error listing orders:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
}

export async function getOrder(req, res) {
  try {
    const doc = await ordersRef.doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Pedido no encontrado.' });
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error getting order:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
}

export async function updateOrder(req, res) {
  try {
    const doc = await ordersRef.doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Pedido no encontrado.' });
    }

    const updates = { ...req.body, updatedAt: new Date() };
    delete updates.createdAt;
    delete updates.id;
    delete updates.orderNumber;

    await ordersRef.doc(req.params.id).update(updates);
    const updated = await ordersRef.doc(req.params.id).get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
}

const VALID_STATUSES = ['nuevo', 'contactado', 'en_conversacion', 'confirmado', 'pagado', 'enviado', 'entregado', 'cancelado'];

export async function updateOrderStatus(req, res) {
  try {
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Estado inválido. Valores permitidos: ${VALID_STATUSES.join(', ')}`,
      });
    }

    const doc = await ordersRef.doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Pedido no encontrado.' });
    }

    await ordersRef.doc(req.params.id).update({ status, updatedAt: new Date() });
    const updated = await ordersRef.doc(req.params.id).get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
}

export async function deleteOrder(req, res) {
  try {
    const doc = await ordersRef.doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Pedido no encontrado.' });
    }

    await ordersRef.doc(req.params.id).delete();
    res.json({ success: true, message: 'Pedido eliminado.' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
}
