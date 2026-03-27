import { db } from '../config/firebase.js';
import { cache, withRetry } from '../utils/cache.js';

export async function searchProducts(req, res) {
  const q = (req.query.q || '').trim().toLowerCase();
  if (q.length < 2) {
    return res.json({ products: [], categories: [] });
  }

  const productLimit = parseInt(req.query.limit, 10) || 5;
  const categoryLimit = parseInt(req.query.categoryLimit, 10) || 3;
  const cacheKey = `search:${q}:${productLimit}:${categoryLimit}`;

  try {
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    // Fetch all active products
    const productSnapshot = await withRetry(() =>
      db.collection('products').where('isActive', '==', true).get()
    );

    // Fetch visible categories
    const categorySnapshot = await withRetry(() =>
      db.collection('categories').where('isActive', '==', true).get()
    );

    const allCategories = categorySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(c => !c.hiddenFromStore);

    // Build a set of hidden category IDs for filtering products
    const hiddenCatSnapshot = await withRetry(() =>
      db.collection('categories').where('hiddenFromStore', '==', true).get()
    );
    const hiddenIds = new Set(hiddenCatSnapshot.docs.map(d => d.id));

    // Search products: match against name, tags, categoryName, parentCategoryName
    const matchedProducts = productSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(p => !hiddenIds.has(p.categoryId) && !hiddenIds.has(p.parentCategoryId))
      .filter(p => {
        const name = (p.name || '').toLowerCase();
        const categoryName = (p.categoryName || '').toLowerCase();
        const parentCategoryName = (p.parentCategoryName || '').toLowerCase();
        const tags = (p.tags || []).map(t => t.toLowerCase());
        return (
          name.includes(q) ||
          categoryName.includes(q) ||
          parentCategoryName.includes(q) ||
          tags.some(t => t.includes(q))
        );
      })
      .sort((a, b) => {
        // Prioritize name matches
        const aName = (a.name || '').toLowerCase().includes(q) ? 0 : 1;
        const bName = (b.name || '').toLowerCase().includes(q) ? 0 : 1;
        return aName - bName;
      })
      .slice(0, productLimit);

    // Search categories: match against name
    const matchedCategories = allCategories
      .filter(c => (c.name || '').toLowerCase().includes(q))
      .map(c => {
        const parent = c.parentId
          ? allCategories.find(p => p.id === c.parentId)
          : null;
        return {
          id: c.id,
          name: c.name,
          slug: c.slug,
          parentId: c.parentId || null,
          parentName: parent ? parent.name : null,
        };
      })
      .slice(0, categoryLimit);

    const result = { products: matchedProducts, categories: matchedCategories };
    cache.set(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error('Error searching products:', error);
    const stale = cache.getStale(cacheKey);
    if (stale) return res.json(stale);
    res.status(500).json({ error: 'Error del servidor.' });
  }
}
