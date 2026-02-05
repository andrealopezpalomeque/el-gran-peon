import { db } from '../config/firebase.js';
import slugify from 'slugify';
import cloudinary from '../config/cloudinary.js';

const productsRef = db.collection('products');

export async function listActiveProducts(req, res) {
  try {
    const snapshot = await productsRef.where('isActive', '==', true).get();
    let products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

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

    // Sort by createdAt descending
    products.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
      const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
      return dateB - dateA;
    });

    // Apply limit
    if (req.query.limit) {
      products = products.slice(0, parseInt(req.query.limit, 10));
    }

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

    // Try by ID first
    const doc = await productsRef.doc(idOrSlug).get();
    if (doc.exists) {
      return res.json({ id: doc.id, ...doc.data() });
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
    res.json({ id: slugDoc.id, ...slugDoc.data() });
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
      images, stock, isActive, isFeatured,
      tags, bulkAvailable, bulkMinQuantity, bulkWhatsappMessage,
    } = req.body;

    if (!name || !price || !categoryId) {
      return res.status(400).json({ error: 'Nombre, precio y categoría son requeridos.' });
    }

    const slug = slugify(name, { lower: true, strict: true });
    const cloudinaryFolder = req.body.cloudinaryFolder || slug;
    const now = new Date();

    const data = {
      name,
      slug,
      description: description || '',
      shortDescription: shortDescription || '',
      price,
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
      tags: tags || [],
      bulkAvailable: bulkAvailable ?? false,
      bulkMinQuantity: bulkMinQuantity || null,
      bulkWhatsappMessage: bulkWhatsappMessage || '',
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await productsRef.add(data);
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

    await productsRef.doc(req.params.id).update(updates);
    const updated = await productsRef.doc(req.params.id).get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (error) {
    console.error('Error updating product:', error);
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
    res.json({ success: true, message: 'Producto eliminado.' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
}
