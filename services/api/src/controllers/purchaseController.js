import { db } from '../config/firebase.js';
import { cache } from '../utils/cache.js';

const purchasesRef = db.collection('purchases');
const productsRef = db.collection('products');

export async function createPurchase(req, res) {
  try {
    const {
      date, productId, productSku, productName,
      quantity, unitPrice, supplier, totalPaid, notes,
    } = req.body;

    if (!productId || !quantity || !unitPrice) {
      return res.status(400).json({ error: 'Producto, cantidad y precio unitario son requeridos.' });
    }

    const now = new Date();

    const purchaseData = {
      date: date || now.toISOString(),
      productId,
      productSku: productSku || '',
      productName: productName || '',
      quantity,
      unitPrice,
      supplier: supplier || '',
      totalPaid: totalPaid ?? quantity * unitPrice,
      notes: notes || '',
      createdAt: now,
      updatedAt: now,
    };

    // Atomic: create purchase + update product stock/cost in a single transaction
    const newPurchaseRef = purchasesRef.doc();
    await db.runTransaction(async (t) => {
      const productDoc = await t.get(productsRef.doc(productId));

      if (!productDoc.exists) {
        throw new Error('Producto no encontrado.');
      }

      const product = productDoc.data();
      const oldStock = product.stock ?? 0;
      const oldCost = product.cost ?? 0;

      const newStock = oldStock + quantity;
      const newCost = newStock > 0
        ? ((oldStock * oldCost) + (quantity * unitPrice)) / newStock
        : unitPrice;

      const updates = {
        stock: newStock,
        cost: newCost,
        updatedAt: now,
      };

      if (product.price) {
        updates.marginPercent = ((product.price - newCost) / newCost) * 100;
      }

      if (product.wholesalePrice) {
        updates.wholesaleMarginPercent = ((product.wholesalePrice - newCost) / newCost) * 100;
      }

      t.set(newPurchaseRef, purchaseData);
      t.update(productsRef.doc(productId), updates);
    });

    cache.invalidatePrefix('products:');

    res.status(201).json({ id: newPurchaseRef.id, ...purchaseData });
  } catch (error) {
    console.error('Error creating purchase:', error);
    if (error.message === 'Producto no encontrado.') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Error del servidor.' });
  }
}

export async function listPurchases(req, res) {
  try {
    const snapshot = await purchasesRef.orderBy('date', 'desc').get();
    let purchases = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (req.query.productId) {
      purchases = purchases.filter(p => p.productId === req.query.productId);
    }

    if (req.query.supplier) {
      purchases = purchases.filter(p => p.supplier === req.query.supplier);
    }

    if (req.query.dateFrom) {
      purchases = purchases.filter(p => p.date >= req.query.dateFrom);
    }

    if (req.query.dateTo) {
      purchases = purchases.filter(p => p.date <= req.query.dateTo);
    }

    res.json(purchases);
  } catch (error) {
    console.error('Error listing purchases:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
}

export async function getPurchase(req, res) {
  try {
    const doc = await purchasesRef.doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Compra no encontrada.' });
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error getting purchase:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
}

export async function updatePurchase(req, res) {
  try {
    const doc = await purchasesRef.doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Compra no encontrada.' });
    }

    const updates = {
      updatedAt: new Date(),
    };

    // Only allow non-financial fields
    if (req.body.date !== undefined) updates.date = req.body.date;
    if (req.body.supplier !== undefined) updates.supplier = req.body.supplier;
    if (req.body.notes !== undefined) updates.notes = req.body.notes;

    await purchasesRef.doc(req.params.id).update(updates);
    const updated = await purchasesRef.doc(req.params.id).get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (error) {
    console.error('Error updating purchase:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
}

export async function deletePurchase(req, res) {
  try {
    const doc = await purchasesRef.doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Compra no encontrada.' });
    }

    console.warn('Eliminando compra sin revertir cambios de stock/costo:', req.params.id);

    await purchasesRef.doc(req.params.id).delete();
    res.json({ success: true, message: 'Compra eliminada.' });
  } catch (error) {
    console.error('Error deleting purchase:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
}
