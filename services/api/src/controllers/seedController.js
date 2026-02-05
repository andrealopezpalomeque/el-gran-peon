import { db } from '../config/firebase.js';
import slugify from 'slugify';

const categoriesRef = db.collection('categories');

const PARENT_CATEGORIES = [
  { name: 'Mate', description: 'Mundo mate: tradición en cada sorbo.', order: 1 },
  { name: 'Asado', description: 'Herramientas de campo para el fuego.', order: 2 },
  { name: 'Gorras', description: 'Gorras de campo.', order: 3 },
  { name: 'Camisas', description: 'Camisas de tradición.', order: 4 },
];

const CHILD_CATEGORIES = {
  mate: [
    { name: 'Mates', order: 1 },
    { name: 'Bombillas', order: 2 },
    { name: 'Termeras', order: 3 },
    { name: 'Yerberas', order: 4 },
  ],
  asado: [
    { name: 'Cuchillos', order: 1 },
  ],
};

export async function seedCategories(req, res) {
  try {
    const now = new Date();
    const created = [];
    const skipped = [];

    // Create parent categories
    const parentIdMap = {};

    for (const parent of PARENT_CATEGORIES) {
      const slug = slugify(parent.name, { lower: true, strict: true });

      // Check if already exists
      const existing = await categoriesRef.where('slug', '==', slug).limit(1).get();
      if (!existing.empty) {
        parentIdMap[slug] = existing.docs[0].id;
        skipped.push(parent.name);
        continue;
      }

      const data = {
        name: parent.name,
        slug,
        description: parent.description,
        image: '',
        imagePublicId: '',
        order: parent.order,
        isActive: true,
        parentId: null,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await categoriesRef.add(data);
      parentIdMap[slug] = docRef.id;
      created.push({ id: docRef.id, ...data });
    }

    // Create child categories
    for (const [parentSlug, children] of Object.entries(CHILD_CATEGORIES)) {
      const parentId = parentIdMap[parentSlug];
      if (!parentId) continue;

      for (const child of children) {
        const slug = slugify(child.name, { lower: true, strict: true });

        // Check if already exists
        const existing = await categoriesRef.where('slug', '==', slug).limit(1).get();
        if (!existing.empty) {
          skipped.push(child.name);
          continue;
        }

        const data = {
          name: child.name,
          slug,
          description: '',
          image: '',
          imagePublicId: '',
          order: child.order,
          isActive: true,
          parentId,
          createdAt: now,
          updatedAt: now,
        };

        const docRef = await categoriesRef.add(data);
        created.push({ id: docRef.id, ...data });
      }
    }

    // Return nested structure
    const snapshot = await categoriesRef.orderBy('order', 'asc').get();
    const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const parents = all
      .filter(c => !c.parentId)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const nested = parents.map(parent => ({
      ...parent,
      children: all
        .filter(c => c.parentId === parent.id)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    }));

    res.status(201).json({
      message: `Seed completado. Creadas: ${created.length}, omitidas: ${skipped.length}.`,
      created: created.map(c => c.name),
      skipped,
      categories: nested,
    });
  } catch (error) {
    console.error('Error seeding categories:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
}
