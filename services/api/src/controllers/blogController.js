import { db } from '../config/firebase.js'
import slugify from 'slugify'
import cloudinary from '../config/cloudinary.js'
import { cache, withRetry } from '../utils/cache.js'

const blogsRef = db.collection('blog-posts')

const VALID_CATEGORIES = ['Lanzamiento', 'Proceso', 'Historia', 'Noticia']

// Fields to exclude from list responses (performance)
const LIST_EXCLUDE_FIELDS = ['body', 'seoTitle', 'seoDescription']

async function generateUniqueSlug(title, excludeId = null) {
  const baseSlug = slugify(title, { lower: true, strict: true })
  let slug = baseSlug
  let counter = 1

  while (true) {
    const existing = await blogsRef.where('slug', '==', slug).get()
    const conflict = existing.docs.find(doc => doc.id !== excludeId)
    if (!conflict) return slug
    slug = `${baseSlug}-${++counter}`
  }
}

function stripListFields(post) {
  const stripped = { ...post }
  LIST_EXCLUDE_FIELDS.forEach(f => delete stripped[f])
  return stripped
}

// GET /api/blog — public, published posts sorted by publishedAt desc
export async function listPublishedPosts(req, res) {
  try {
    const cacheKey = `blogs:published:${JSON.stringify(req.query)}`
    const cached = cache.get(cacheKey)
    if (cached) return res.json(cached)

    const snapshot = await withRetry(() =>
      blogsRef.where('isPublished', '==', true).orderBy('publishedAt', 'desc').get()
    )

    let posts = snapshot.docs.map(doc => stripListFields({ id: doc.id, ...doc.data() }))

    const limit = parseInt(req.query.limit)
    if (limit > 0) posts = posts.slice(0, limit)

    const result = { posts }
    cache.set(cacheKey, result)
    res.json(result)
  } catch (error) {
    console.error('Error listing published posts:', error)
    const stale = cache.getStale(`blogs:published:${JSON.stringify(req.query)}`)
    if (stale) return res.json(stale)
    res.status(500).json({ error: 'Error del servidor.' })
  }
}

// GET /api/blog/all — protected, all posts for back-office
export async function listAllPosts(req, res) {
  try {
    const cacheKey = 'blogs:all'
    const cached = cache.get(cacheKey)
    if (cached) return res.json(cached)

    const snapshot = await withRetry(() =>
      blogsRef.orderBy('createdAt', 'desc').get()
    )

    const posts = snapshot.docs.map(doc => stripListFields({ id: doc.id, ...doc.data() }))
    const result = { posts }
    cache.set(cacheKey, result)
    res.json(result)
  } catch (error) {
    console.error('Error listing all posts:', error)
    const stale = cache.getStale('blogs:all')
    if (stale) return res.json(stale)
    res.status(500).json({ error: 'Error del servidor.' })
  }
}

// GET /api/blog/:slug — public, single post by slug
export async function getPost(req, res) {
  try {
    const { slug } = req.params
    const cacheKey = `blogs:slug:${slug}`
    const cached = cache.get(cacheKey)
    if (cached) return res.json(cached)

    const snapshot = await withRetry(() =>
      blogsRef.where('slug', '==', slug).where('isPublished', '==', true).get()
    )

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Post no encontrado.' })
    }

    const doc = snapshot.docs[0]
    const post = { id: doc.id, ...doc.data() }
    cache.set(cacheKey, post)
    res.json(post)
  } catch (error) {
    console.error('Error getting post:', error)
    res.status(500).json({ error: 'Error del servidor.' })
  }
}

// POST /api/blog — protected, create post
export async function createPost(req, res) {
  try {
    const { title, subtitle, category, heroImage, body, excerpt, seoTitle, seoDescription, isPublished } = req.body

    if (!title) return res.status(400).json({ error: 'Titulo requerido.' })
    if (!category || !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'Categoria invalida.' })
    }
    if (!body) return res.status(400).json({ error: 'Contenido requerido.' })
    if (!excerpt) return res.status(400).json({ error: 'Extracto requerido.' })
    if (!heroImage || !heroImage.url) return res.status(400).json({ error: 'Imagen principal requerida.' })

    const slug = await generateUniqueSlug(title)
    const now = new Date()

    const data = {
      title,
      subtitle: subtitle || '',
      slug,
      category,
      heroImage,
      body,
      excerpt,
      seoTitle: seoTitle || '',
      seoDescription: seoDescription || '',
      isPublished: isPublished ?? false,
      publishedAt: isPublished ? now : null,
      createdAt: now,
      updatedAt: now,
    }

    const docRef = await blogsRef.add(data)
    cache.invalidatePrefix('blogs:')
    res.status(201).json({ id: docRef.id, ...data })
  } catch (error) {
    console.error('Error creating post:', error)
    res.status(500).json({ error: 'Error del servidor.' })
  }
}

// PUT /api/blog/:id — protected, update post
export async function updatePost(req, res) {
  try {
    const docRef = blogsRef.doc(req.params.id)
    const doc = await docRef.get()

    if (!doc.exists) {
      return res.status(404).json({ error: 'Post no encontrado.' })
    }

    const existing = doc.data()
    const { title, subtitle, category, heroImage, body, excerpt, seoTitle, seoDescription, isPublished } = req.body

    if (category && !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'Categoria invalida.' })
    }

    const updates = {
      updatedAt: new Date(),
    }

    if (title !== undefined) updates.title = title
    if (subtitle !== undefined) updates.subtitle = subtitle
    if (category !== undefined) updates.category = category
    if (heroImage !== undefined) updates.heroImage = heroImage
    if (body !== undefined) updates.body = body
    if (excerpt !== undefined) updates.excerpt = excerpt
    if (seoTitle !== undefined) updates.seoTitle = seoTitle
    if (seoDescription !== undefined) updates.seoDescription = seoDescription

    // Regenerate slug if title changed
    if (title && title !== existing.title) {
      updates.slug = await generateUniqueSlug(title, req.params.id)
    }

    // publishedAt logic: set on first publish, never reset
    if (isPublished !== undefined) {
      updates.isPublished = isPublished
      if (isPublished && !existing.publishedAt) {
        updates.publishedAt = new Date()
      }
    }

    // Clean up old hero image from Cloudinary if replaced
    if (heroImage && existing.heroImage?.publicId && heroImage.publicId !== existing.heroImage.publicId) {
      try {
        await cloudinary.uploader.destroy(existing.heroImage.publicId)
      } catch (err) {
        console.error('Error deleting old hero image:', err)
      }
    }

    await docRef.update(updates)
    cache.invalidatePrefix('blogs:')

    const updated = await docRef.get()
    res.json({ id: updated.id, ...updated.data() })
  } catch (error) {
    console.error('Error updating post:', error)
    res.status(500).json({ error: 'Error del servidor.' })
  }
}

// GET /api/blog/admin/:id — protected, single post with all fields for editing
export async function getPostAdmin(req, res) {
  try {
    const doc = await blogsRef.doc(req.params.id).get()

    if (!doc.exists) {
      return res.status(404).json({ error: 'Post no encontrado.' })
    }

    res.json({ id: doc.id, ...doc.data() })
  } catch (error) {
    console.error('Error getting post for admin:', error)
    res.status(500).json({ error: 'Error del servidor.' })
  }
}

// DELETE /api/blog/:id — protected, delete post
export async function deletePost(req, res) {
  try {
    const docRef = blogsRef.doc(req.params.id)
    const doc = await docRef.get()

    if (!doc.exists) {
      return res.status(404).json({ error: 'Post no encontrado.' })
    }

    const data = doc.data()

    // Delete hero image from Cloudinary
    if (data.heroImage?.publicId) {
      try {
        await cloudinary.uploader.destroy(data.heroImage.publicId)
      } catch (err) {
        console.error('Error deleting hero image:', err)
      }
    }

    await docRef.delete()
    cache.invalidatePrefix('blogs:')
    res.json({ message: 'Post eliminado.' })
  } catch (error) {
    console.error('Error deleting post:', error)
    res.status(500).json({ error: 'Error del servidor.' })
  }
}
