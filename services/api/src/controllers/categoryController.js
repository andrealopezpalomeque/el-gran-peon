import { db } from '../config/firebase.js';
import slugify from 'slugify';
import { cache } from '../utils/cache.js';

const categoriesRef = db.collection('categories');

function buildNestedCategories(categories) {
  const parents = categories
    .filter(c => !c.parentId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return parents.map(parent => ({
    ...parent,
    children: categories
      .filter(c => c.parentId === parent.id)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
  }));
}

export async function listActiveCategories(req, res) {
  try {
    const cacheKey = `categories:active:${JSON.stringify(req.query)}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    // If ?parent=slug is provided, return active children of that parent (even if hiddenFromStore)
    if (req.query.parent) {
      const parentSnapshot = await categoriesRef
        .where('slug', '==', req.query.parent)
        .where('parentId', '==', null)
        .limit(1)
        .get();

      if (parentSnapshot.empty) {
        return res.json([]);
      }

      const parentId = parentSnapshot.docs[0].id;
      const childrenSnapshot = await categoriesRef
        .where('parentId', '==', parentId)
        .where('isActive', '==', true)
        .get();

      const children = childrenSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      cache.set(cacheKey, children);
      return res.json(children);
    }

    const snapshot = await categoriesRef.where('isActive', '==', true).get();
    const categories = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(c => !c.hiddenFromStore);
    const result = buildNestedCategories(categories);
    cache.set(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error('Error listing categories:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
}

export async function listAllCategories(req, res) {
  try {
    const snapshot = await categoriesRef.orderBy('order', 'asc').get();
    const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(buildNestedCategories(categories));
  } catch (error) {
    console.error('Error listing all categories:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
}

export async function listFlatCategories(req, res) {
  try {
    const snapshot = await categoriesRef.orderBy('order', 'asc').get();
    const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(categories);
  } catch (error) {
    console.error('Error listing flat categories:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
}

export async function getCategory(req, res) {
  try {
    const cacheKey = `categories:single:${req.params.id}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const doc = await categoriesRef.doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Categoría no encontrada.' });
    }

    const category = { id: doc.id, ...doc.data() };
    cache.set(cacheKey, category);
    res.json(category);
  } catch (error) {
    console.error('Error getting category:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
}

export async function createCategory(req, res) {
  try {
    const { name, description, image, imagePublicId, order, isActive, parentId } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'El nombre es requerido.' });
    }

    // If parentId is provided, verify the parent exists
    if (parentId) {
      const parentDoc = await categoriesRef.doc(parentId).get();
      if (!parentDoc.exists) {
        return res.status(400).json({ error: 'La categoría padre no existe.' });
      }
    }

    const slug = slugify(name, { lower: true, strict: true });
    const now = new Date();

    const data = {
      name,
      slug,
      description: description || '',
      image: image || '',
      imagePublicId: imagePublicId || '',
      order: order ?? 0,
      isActive: isActive ?? true,
      hiddenFromStore: req.body.hiddenFromStore ?? false,
      parentId: parentId || null,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await categoriesRef.add(data);
    cache.invalidatePrefix('categories:');
    cache.invalidatePrefix('products:');
    res.status(201).json({ id: docRef.id, ...data });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
}

export async function updateCategory(req, res) {
  try {
    const doc = await categoriesRef.doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Categoría no encontrada.' });
    }

    const updates = { ...req.body, updatedAt: new Date() };

    if (updates.name) {
      updates.slug = slugify(updates.name, { lower: true, strict: true });
    }

    // If parentId is provided, verify the parent exists
    if (updates.parentId) {
      const parentDoc = await categoriesRef.doc(updates.parentId).get();
      if (!parentDoc.exists) {
        return res.status(400).json({ error: 'La categoría padre no existe.' });
      }
      // Prevent setting self as parent
      if (updates.parentId === req.params.id) {
        return res.status(400).json({ error: 'Una categoría no puede ser su propio padre.' });
      }
    }

    // Don't allow overwriting createdAt
    delete updates.createdAt;
    delete updates.id;

    await categoriesRef.doc(req.params.id).update(updates);
    cache.invalidatePrefix('categories:');
    cache.invalidatePrefix('products:');
    const updated = await categoriesRef.doc(req.params.id).get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
}

export async function deleteCategory(req, res) {
  try {
    const doc = await categoriesRef.doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Categoría no encontrada.' });
    }

    // Check if this is a parent category with children
    const childrenSnapshot = await categoriesRef
      .where('parentId', '==', req.params.id)
      .get();

    if (!childrenSnapshot.empty) {
      return res.status(400).json({
        error: 'No se puede eliminar una categoría que tiene subcategorías. Elimine las subcategorías primero.',
      });
    }

    await categoriesRef.doc(req.params.id).delete();
    cache.invalidatePrefix('categories:');
    cache.invalidatePrefix('products:');
    res.json({ success: true, message: 'Categoría eliminada.' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
}
