import { db } from '../config/firebase.js';
import slugify from 'slugify';
import cloudinary from '../config/cloudinary.js';
import { processVideos } from '../utils/videoUtils.js';
import { cache } from '../utils/cache.js';

const productsRef = db.collection('products');

export async function listActiveProducts(req, res) {
  try {
    const cacheKey = `products:active:${JSON.stringify(req.query)}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const snapshot = await productsRef.where('isActive', '==', true).get();
    let products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Exclude products from hidden categories (empresariales, mayoristas, etc.)
    // unless explicitly requesting a parentCategory filter
    if (!req.query.parentCategory) {
      const hiddenSnapshot = await db.collection('categories')
        .where('hiddenFromStore', '==', true)
        .get();

      if (!hiddenSnapshot.empty) {
        const hiddenIds = new Set(hiddenSnapshot.docs.map(d => d.id));
        products = products.filter(p =>
          !hiddenIds.has(p.categoryId) && !hiddenIds.has(p.parentCategoryId)
        );
      }
    }

    // Filter by child category slug
    if (req.query.category) {
      const catSnapshot = await db.collection('categories')
        .where('slug', '==', req.query.category)
        .limit(1)
        .get();

      if (catSnapshot.empty) {
        return res.json([]);
      }

      const categoryId = catSnapshot.docs[0].id;
      products = products.filter(p => p.categoryId === categoryId);
    }

    // Filter by parent category slug (returns all products under that parent)
    if (req.query.parentCategory) {
      const parentSnapshot = await db.collection('categories')
        .where('slug', '==', req.query.parentCategory)
        .where('parentId', '==', null)
        .limit(1)
        .get();

      if (parentSnapshot.empty) {
        return res.json([]);
      }

      const parentId = parentSnapshot.docs[0].id;

      // Get all child category IDs under this parent
      const childrenSnapshot = await db.collection('categories')
        .where('parentId', '==', parentId)
        .get();

      const categoryIds = [parentId, ...childrenSnapshot.docs.map(d => d.id)];
      products = products.filter(p => categoryIds.includes(p.categoryId) || p.parentCategoryId === parentId);
    }

    // Filter featured
    if (req.query.featured === 'true') {
      products = products.filter(p => p.isFeatured === true);
    }

    // Sort: featured products by featuredOrder ASC then createdAt DESC, others by createdAt DESC
    if (req.query.featured === 'true') {
      products.sort((a, b) => {
        const orderA = a.featuredOrder || 0;
        const orderB = b.featuredOrder || 0;
        // 0 means unset — push to end
        if (orderA !== orderB) {
          if (orderA === 0) return 1;
          if (orderB === 0) return -1;
          return orderA - orderB;
        }
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return dateB - dateA;
      });
    } else {
      products.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return dateB - dateA;
      });
    }

    // Apply limit
    if (req.query.limit) {
      products = products.slice(0, parseInt(req.query.limit, 10));
    }

    cache.set(cacheKey, products);
    res.json(products);
  } catch (error) {
    console.error('Error listing products:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
}

export async function listAllProducts(req, res) {
  try {
    const snapshot = await productsRef.orderBy('createdAt', 'desc').get();
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(products);
  } catch (error) {
    console.error('Error listing all products:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
}

export async function getProduct(req, res) {
  try {
    const { idOrSlug } = req.params;
    const cacheKey = `products:single:${idOrSlug}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    // Try by ID first
    const doc = await productsRef.doc(idOrSlug).get();
    if (doc.exists) {
      const product = { id: doc.id, ...doc.data() };
      cache.set(cacheKey, product);
      return res.json(product);
    }

    // Try by slug
    const slugSnapshot = await productsRef
      .where('slug', '==', idOrSlug)
      .limit(1)
      .get();

    if (slugSnapshot.empty) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    const slugDoc = slugSnapshot.docs[0];
    const product = { id: slugDoc.id, ...slugDoc.data() };
    cache.set(cacheKey, product);
    res.json(product);
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
}

export async function createProduct(req, res) {
  try {
    const {
      name, description, shortDescription, price, compareAtPrice,
      categoryId, categoryName, parentCategoryId, parentCategoryName,
      images, videos, stock, isActive, isFeatured, freeShipping,
      tags, customizations,
    } = req.body;

    if (!name || !categoryId) {
      return res.status(400).json({ error: 'Nombre y categoría son requeridos.' });
    }

    const slug = slugify(name, { lower: true, strict: true });
    const cloudinaryFolder = req.body.cloudinaryFolder || slug;
    const now = new Date();

    let resolvedFeaturedOrder = 0;

    if (isFeatured) {
      const featuredSnapshot = await productsRef.where('isFeatured', '==', true).get();
      if (featuredSnapshot.docs.length >= 10) {
        return res.status(400).json({ error: 'Máximo 10 productos destacados.' });
      }

      const takenOrders = featuredSnapshot.docs.map(d => d.data().featuredOrder || 0);
      const maxOrder = takenOrders.length > 0 ? Math.max(...takenOrders) : 0;
      resolvedFeaturedOrder = maxOrder + 1;
    }

    const data = {
      name,
      slug,
      description: description || '',
      shortDescription: shortDescription || '',
      price: price || null,
      compareAtPrice: compareAtPrice || null,
      categoryId,
      categoryName: categoryName || '',
      parentCategoryId: parentCategoryId || null,
      parentCategoryName: parentCategoryName || '',
      images: images || [],
      cloudinaryFolder,
      stock: stock ?? 0,
      isActive: isActive ?? true,
      isFeatured: isFeatured ?? false,
      featuredOrder: isFeatured ? resolvedFeaturedOrder : 0,
      tags: tags || [],
      freeShipping: freeShipping ?? false,
      customizations: customizations || [],
      videos: videos ? processVideos(videos) : [],
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await productsRef.add(data);
    cache.invalidatePrefix('products:');
    res.status(201).json({ id: docRef.id, ...data });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
}

export async function updateProduct(req, res) {
  try {
    const doc = await productsRef.doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    const updates = { ...req.body, updatedAt: new Date() };

    if (updates.name) {
      updates.slug = slugify(updates.name, { lower: true, strict: true });
    }

    // Don't allow overwriting these fields
    delete updates.createdAt;
    delete updates.id;
    delete updates.cloudinaryFolder;

    // Process video URLs if provided
    if (updates.videos) {
      updates.videos = processVideos(updates.videos);
    }

    // Featured logic
    const oldData = doc.data();
    const wasFeatured = oldData.isFeatured ?? false;

    if (updates.isFeatured === true && !wasFeatured) {
      // Toggling ON: enforce max 10, auto-assign to end
      const featuredSnapshot = await productsRef.where('isFeatured', '==', true).get();
      const othersCount = featuredSnapshot.docs.filter(d => d.id !== req.params.id).length;

      if (othersCount >= 10) {
        return res.status(400).json({ error: 'Máximo 10 productos destacados.' });
      }

      const otherOrders = featuredSnapshot.docs
        .filter(d => d.id !== req.params.id)
        .map(d => d.data().featuredOrder || 0);
      const maxOrder = otherOrders.length > 0 ? Math.max(...otherOrders) : 0;
      updates.featuredOrder = maxOrder + 1;
    } else if (updates.isFeatured === false) {
      // Toggling OFF: reset order
      updates.featuredOrder = 0;
    }
    // If already featured and staying featured, don't touch featuredOrder (managed by reorder endpoint)
    if (updates.isFeatured === undefined || (updates.isFeatured === true && wasFeatured)) {
      delete updates.featuredOrder;
    }

    await productsRef.doc(req.params.id).update(updates);
    cache.invalidatePrefix('products:');
    const updated = await productsRef.doc(req.params.id).get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
}

export async function reorderFeatured(req, res) {
  try {
    const { order } = req.body;

    if (!Array.isArray(order) || order.length === 0 || order.length > 10) {
      return res.status(400).json({ error: 'Se requiere un array de 1-10 productos.' });
    }

    const batch = db.batch();
    const now = new Date();

    for (const item of order) {
      if (!item.id || typeof item.featuredOrder !== 'number') {
        return res.status(400).json({ error: 'Cada item necesita id y featuredOrder.' });
      }
      batch.update(productsRef.doc(item.id), {
        featuredOrder: item.featuredOrder,
        updatedAt: now,
      });
    }

    await batch.commit();
    cache.invalidatePrefix('products:');
    res.json({ success: true });
  } catch (error) {
    console.error('Error reordering featured:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
}

export async function deleteProduct(req, res) {
  try {
    const doc = await productsRef.doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    const productData = doc.data();

    // Delete images from Cloudinary
    if (productData.images && productData.images.length > 0) {
      for (const img of productData.images) {
        if (img.publicId) {
          try {
            await cloudinary.uploader.destroy(img.publicId);
          } catch (err) {
            console.error(`Error deleting image ${img.publicId}:`, err);
          }
        }
      }
    }

    await productsRef.doc(req.params.id).delete();
    cache.invalidatePrefix('products:');
    res.json({ success: true, message: 'Producto eliminado.' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
}
