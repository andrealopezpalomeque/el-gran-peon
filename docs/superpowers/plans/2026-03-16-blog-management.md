# Blog Management System - Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a full blog management system — API CRUD, back-office editor, and storefront rendering — so the client can create and publish blog posts from the admin panel.

**Architecture:** New Firestore collection `blog-posts` with Express CRUD endpoints following existing product/category patterns. Back-office gets a blog section with TipTap rich text editor (extending existing component). Storefront renders posts dynamically with the same `.prose-article` styling already in use.

**Tech Stack:** Express.js, Firebase Firestore, Cloudinary, TipTap (already installed), Nuxt 4, Tailwind CSS

**Spec:** `docs/superpowers/specs/2026-03-16-blog-management-design.md`

---

## File Structure

### New Files
| File | Responsibility |
|------|---------------|
| `services/api/src/routes/blog.js` | Express routes for blog CRUD |
| `services/api/src/controllers/blogController.js` | Business logic: create, read, update, delete blog posts |
| `apps/back-office/pages/blog/index.vue` | Admin blog post list with status, delete |
| `apps/back-office/pages/blog/nuevo.vue` | Create blog post form |
| `apps/back-office/pages/blog/[id].vue` | Edit blog post form |
| `apps/home/pages/blog/index.vue` | Public blog listing page |
| `apps/home/pages/blog/[slug].vue` | Dynamic blog post page (replaces capsula-raiz.vue) |

### Modified Files
| File | Change |
|------|--------|
| `services/api/src/index.js` | Register blog routes |
| `apps/back-office/components/admin/RichTextEditor.vue` | Enable H2, H3, bulletList, orderedList + toolbar buttons + editor styles |
| `apps/back-office/layouts/admin.vue` | Add "Blog" nav item |
| `apps/home/pages/nosotros.vue` | Replace hardcoded blog card with dynamic fetch of latest 3 posts |

### Removed Files
| File | Reason |
|------|--------|
| `apps/home/pages/blog/capsula-raiz.vue` | Replaced by dynamic `[slug].vue` |

---

## Chunk 1: API Layer

### Task 1: Create blog controller

**Files:**
- Create: `services/api/src/controllers/blogController.js`

- [ ] **Step 1: Create the blog controller with all CRUD functions**

Create `services/api/src/controllers/blogController.js` following the exact pattern from `productController.js`:

```javascript
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
```

- [ ] **Step 2: Verify file was created**

Run: `ls -la services/api/src/controllers/blogController.js`
Expected: File exists

- [ ] **Step 3: Commit**

```bash
git add services/api/src/controllers/blogController.js
git commit -m "feat(api): add blog controller with full CRUD"
```

---

### Task 2: Create blog routes and register them

**Files:**
- Create: `services/api/src/routes/blog.js`
- Modify: `services/api/src/index.js`

- [ ] **Step 1: Create the blog routes file**

Create `services/api/src/routes/blog.js` following the exact pattern from `routes/products.js`:

```javascript
import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import {
  listPublishedPosts,
  listAllPosts,
  getPost,
  getPostAdmin,
  createPost,
  updatePost,
  deletePost,
} from '../controllers/blogController.js'

const router = Router()

// Public
router.get('/', listPublishedPosts)
// Protected — declared BEFORE /:slug to avoid Express matching "all" or "admin" as slug
router.get('/all', requireAuth, listAllPosts)
router.get('/admin/:id', requireAuth, getPostAdmin)
// Public
router.get('/:slug', getPost)
// Protected
router.post('/', requireAuth, createPost)
router.put('/:id', requireAuth, updatePost)
router.delete('/:id', requireAuth, deletePost)

export default router
```

- [ ] **Step 2: Register blog routes in index.js**

In `services/api/src/index.js`, add the import alongside other route imports:

```javascript
import blogRouter from './routes/blog.js'
```

And add the route registration alongside other `app.use` calls:

```javascript
app.use('/api/blog', blogRouter)
```

- [ ] **Step 3: Verify API starts without errors**

Run: `cd services/api && npm run dev` (verify it starts, then stop)
Expected: No import/syntax errors

**Note:** The query `blogsRef.where('isPublished', '==', true).orderBy('publishedAt', 'desc')` requires a Firestore composite index on the `blog-posts` collection for fields `(isPublished ASC, publishedAt DESC)`. On first query, Firestore will log a URL to create the index — follow it in Firebase Console. Alternatively, create it manually beforehand.

- [ ] **Step 4: Commit**

```bash
git add services/api/src/routes/blog.js services/api/src/index.js
git commit -m "feat(api): add blog routes and register in index"
```

---

## Chunk 2: Back-Office

### Task 3: Enhance RichTextEditor with headings and lists

**Files:**
- Modify: `apps/back-office/components/admin/RichTextEditor.vue`

- [ ] **Step 1: Update the TipTap StarterKit configuration**

In `RichTextEditor.vue`, the StarterKit currently disables heading, bulletList, orderedList, listItem. Change the configuration to enable them (remove them from the disabled list, and configure heading to only allow levels 2 and 3):

First, add a `minHeight` prop to the component so callers can control the editor area height:

```javascript
const props = defineProps({
  modelValue: { type: String, default: '' },
  minHeight: { type: String, default: '120px' },
})
```

Then update the `editorProps.attributes.class` to use the prop dynamically. Replace the hardcoded `min-h-[120px]` with a computed style. In the editor's wrapper div, add `:style="{ minHeight: props.minHeight }"` to the `.tiptap` container via `editorProps`:

```javascript
editorProps: {
  attributes: {
    class: 'px-4 py-2 outline-none',
    style: `min-height: ${props.minHeight}`,
  },
},
```

Next, replace the StarterKit.configure block (currently disabling everything):
```javascript
StarterKit.configure({
  heading: false,
  bulletList: false,
  orderedList: false,
  listItem: false,
  blockquote: false,
  codeBlock: false,
  code: false,
  horizontalRule: false,
}),
```

With:
```javascript
StarterKit.configure({
  heading: { levels: [2, 3] },
  blockquote: false,
  codeBlock: false,
  code: false,
  horizontalRule: false,
}),
```

- [ ] **Step 2: Add toolbar buttons for H2, H3, bullet list, ordered list**

Add the new buttons to the toolbar `<div>` after the existing Bold and Italic buttons. Follow the same button pattern (same classes, same active-state logic):

After the Italic button, add:

```html
<!-- Separator -->
<div class="w-px h-5 bg-brand-olive/20" />

<!-- H2 -->
<button
  type="button"
  class="px-2 py-1 text-sm font-sans border border-brand-olive/20 transition-colors"
  :class="editor.isActive('heading', { level: 2 }) ? 'bg-brand-primary text-brand-cream' : 'text-brand-olive hover:bg-brand-olive/5'"
  @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
>
  H2
</button>

<!-- H3 -->
<button
  type="button"
  class="px-2 py-1 text-sm font-sans border border-brand-olive/20 transition-colors"
  :class="editor.isActive('heading', { level: 3 }) ? 'bg-brand-primary text-brand-cream' : 'text-brand-olive hover:bg-brand-olive/5'"
  @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
>
  H3
</button>

<!-- Separator -->
<div class="w-px h-5 bg-brand-olive/20" />

<!-- Bullet List -->
<button
  type="button"
  class="px-2 py-1 text-sm font-sans border border-brand-olive/20 transition-colors"
  :class="editor.isActive('bulletList') ? 'bg-brand-primary text-brand-cream' : 'text-brand-olive hover:bg-brand-olive/5'"
  @click="editor.chain().focus().toggleBulletList().run()"
>
  &bull; Lista
</button>

<!-- Ordered List -->
<button
  type="button"
  class="px-2 py-1 text-sm font-sans border border-brand-olive/20 transition-colors"
  :class="editor.isActive('orderedList') ? 'bg-brand-primary text-brand-cream' : 'text-brand-olive hover:bg-brand-olive/5'"
  @click="editor.chain().focus().toggleOrderedList().run()"
>
  1. Lista
</button>
```

- [ ] **Step 3: Add editor styles for the new elements**

In the `<style>` section (unscoped — matching the existing pattern), add styles so headings and lists render visually inside the editor. Add after the existing `.rich-editor .tiptap p` rule:

```css
.rich-editor .tiptap h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #4C4A38;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}

.rich-editor .tiptap h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #4C4A38;
  margin-top: 1rem;
  margin-bottom: 0.25rem;
}

.rich-editor .tiptap ul {
  list-style-type: disc;
  padding-left: 1.5rem;
  margin-bottom: 0.75rem;
}

.rich-editor .tiptap ol {
  list-style-type: decimal;
  padding-left: 1.5rem;
  margin-bottom: 0.75rem;
}

.rich-editor .tiptap li {
  margin-bottom: 0.25rem;
}
```

- [ ] **Step 4: Verify the editor renders in the browser**

Run: `cd apps/back-office && npm run dev`
Navigate to: `/productos/nuevo`
Expected: The description field now shows H2, H3, bullet list, ordered list buttons in the toolbar. Clicking them works.

- [ ] **Step 5: Commit**

```bash
git add apps/back-office/components/admin/RichTextEditor.vue
git commit -m "feat(back-office): enhance RichTextEditor with headings and lists"
```

---

### Task 4: Add Blog to admin navigation

**Files:**
- Modify: `apps/back-office/layouts/admin.vue`

- [ ] **Step 1: Add Blog nav item**

In `layouts/admin.vue`, find the `navItems` array (around line 42-51) and add the Blog entry at the end:

```javascript
{ label: 'Blog', to: '/blog' },
```

- [ ] **Step 2: Verify navigation**

Run the back-office dev server and confirm "Blog" appears in the nav bar.

- [ ] **Step 3: Commit**

```bash
git add apps/back-office/layouts/admin.vue
git commit -m "feat(back-office): add Blog to admin navigation"
```

---

### Task 5: Create blog list page in back-office

**Files:**
- Create: `apps/back-office/pages/blog/index.vue`

- [ ] **Step 1: Create the blog list page**

Create `apps/back-office/pages/blog/index.vue` following the pattern from `pages/productos/index.vue` (simplified — no drag-and-drop, no filters, just table + delete):

```vue
<template>
  <NuxtLayout name="admin">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="font-sans text-brand-olive text-2xl font-semibold">Blog</h2>
      <NuxtLink
        to="/blog/nuevo"
        class="px-6 py-2 bg-brand-primary text-brand-cream font-sans text-sm hover:bg-brand-primary/90 transition-colors"
      >
        Nuevo Post
      </NuxtLink>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <p class="font-sans text-brand-olive/60 text-sm">Cargando posts...</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="posts.length === 0" class="text-center py-12">
      <p class="font-sans text-brand-olive/60 text-sm">No hay posts todavia.</p>
      <NuxtLink
        to="/blog/nuevo"
        class="inline-block mt-4 font-sans text-sm text-brand-primary underline underline-offset-4"
      >
        Crear el primer post
      </NuxtLink>
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto">
      <table class="w-full font-sans text-sm">
        <thead>
          <tr class="border-b-2 border-brand-olive/10 text-left">
            <th class="pb-3 font-medium text-brand-olive/60">Titulo</th>
            <th class="pb-3 font-medium text-brand-olive/60">Categoria</th>
            <th class="pb-3 font-medium text-brand-olive/60 text-center">Estado</th>
            <th class="pb-3 font-medium text-brand-olive/60">Fecha</th>
            <th class="pb-3 font-medium text-brand-olive/60 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="post in posts"
            :key="post.id"
            class="border-b border-brand-olive/5 hover:bg-brand-olive/[0.02] transition-colors"
          >
            <td class="py-3 pr-4">
              <div class="flex items-center gap-3">
                <div v-if="post.heroImage?.url" class="w-12 h-9 flex-shrink-0 overflow-hidden bg-brand-cream">
                  <img :src="post.heroImage.url" :alt="post.title" class="w-full h-full object-cover" />
                </div>
                <span class="text-brand-olive font-medium">{{ post.title }}</span>
              </div>
            </td>
            <td class="py-3 pr-4">
              <span class="text-brand-olive/60">{{ post.category }}</span>
            </td>
            <td class="py-3 text-center">
              <span
                class="inline-block px-2 py-0.5 text-xs font-medium"
                :class="post.isPublished
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'"
              >
                {{ post.isPublished ? 'Publicado' : 'Borrador' }}
              </span>
            </td>
            <td class="py-3 pr-4 text-brand-olive/60">
              {{ formatDate(post.publishedAt || post.createdAt) }}
            </td>
            <td class="py-3 text-right">
              <NuxtLink
                :to="`/blog/${post.id}`"
                class="font-sans text-sm text-brand-primary hover:text-brand-primary/70 transition-colors"
              >
                Editar
              </NuxtLink>
              <button
                class="ml-4 font-sans text-sm text-red-600 hover:text-red-800 transition-colors"
                @click="confirmDelete(post)"
              >
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Delete Modal -->
    <AdminConfirmModal
      :visible="showDeleteModal"
      :loading="deleting"
      title="Eliminar post"
      :message="`Se eliminara el post '${postToDelete?.title}'. Esta accion no se puede deshacer.`"
      @confirm="deletePost"
      @cancel="showDeleteModal = false"
    />

    <!-- Toast -->
    <Transition name="toast">
      <div
        v-if="toastMessage"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 font-sans text-sm px-6 py-3"
        :class="toastType === 'success' ? 'bg-green-800 text-white' : 'bg-red-800 text-white'"
      >
        {{ toastMessage }}
      </div>
    </Transition>
  </NuxtLayout>
</template>

<script setup>
const { get, delete: apiDelete } = useApi()
const route = useRoute()
const router = useRouter()

const posts = ref([])
const loading = ref(true)
const showDeleteModal = ref(false)
const postToDelete = ref(null)
const deleting = ref(false)
const toastMessage = ref('')
const toastType = ref('success')
let toastTimeout = null

function formatDate(dateValue) {
  if (!dateValue) return '—'
  const d = dateValue._seconds ? new Date(dateValue._seconds * 1000) : new Date(dateValue)
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function showToast(message, type = 'success') {
  toastMessage.value = message
  toastType.value = type
  if (toastTimeout) clearTimeout(toastTimeout)
  toastTimeout = setTimeout(() => { toastMessage.value = '' }, 3000)
}

function confirmDelete(post) {
  postToDelete.value = post
  showDeleteModal.value = true
}

async function deletePost() {
  deleting.value = true
  try {
    await apiDelete(`/api/blog/${postToDelete.value.id}`)
    posts.value = posts.value.filter(p => p.id !== postToDelete.value.id)
    showDeleteModal.value = false
    showToast(`Post "${postToDelete.value.title}" eliminado`)
  } catch (err) {
    showToast(err.message || 'Error al eliminar', 'error')
  } finally {
    deleting.value = false
  }
}

onMounted(async () => {
  try {
    const data = await get('/api/blog/all')
    posts.value = data.posts || []
  } catch (err) {
    showToast('Error al cargar posts', 'error')
  } finally {
    loading.value = false
  }

  if (route.query.toast) {
    showToast(route.query.toast)
    router.replace({ query: {} })
  }
})
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(1rem);
}
</style>
```

- [ ] **Step 2: Verify the page loads**

Navigate to `/blog` in the back-office. Expected: Empty state with "Crear el primer post" link.

- [ ] **Step 3: Commit**

```bash
git add apps/back-office/pages/blog/index.vue
git commit -m "feat(back-office): add blog post list page"
```

---

### Task 6: Create blog post form (nuevo.vue)

**Files:**
- Create: `apps/back-office/pages/blog/nuevo.vue`

- [ ] **Step 1: Create the blog create form page**

Create `apps/back-office/pages/blog/nuevo.vue`:

```vue
<template>
  <NuxtLayout name="admin">
    <div class="flex items-center justify-between mb-6">
      <h2 class="font-sans text-brand-olive text-2xl font-semibold">Nuevo Post</h2>
    </div>

    <form @submit.prevent="handleSubmit" class="max-w-3xl space-y-10">
      <!-- INFORMACION BASICA -->
      <section>
        <h3 class="font-display uppercase text-brand-olive text-lg mb-4">INFORMACION BASICA</h3>

        <!-- Title -->
        <div class="mb-4">
          <label class="block font-sans text-sm text-brand-olive mb-1">
            Titulo <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.title"
            type="text"
            required
            class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
            placeholder="Titulo del post"
          />
          <p v-if="form.title" class="mt-1 font-sans text-xs text-brand-olive/40">
            Slug: {{ generatedSlug }}
          </p>
        </div>

        <!-- Subtitle -->
        <div class="mb-4">
          <label class="block font-sans text-sm text-brand-olive mb-1">Subtitulo</label>
          <input
            v-model="form.subtitle"
            type="text"
            class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
            placeholder="Linea corta debajo del titulo"
          />
        </div>

        <!-- Category -->
        <div class="mb-4">
          <label class="block font-sans text-sm text-brand-olive mb-1">
            Categoria <span class="text-red-500">*</span>
          </label>
          <select
            v-model="form.category"
            required
            class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
          >
            <option value="" disabled>Seleccionar categoria</option>
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>

        <!-- Excerpt -->
        <div class="mb-4">
          <label class="block font-sans text-sm text-brand-olive mb-1">
            Extracto <span class="text-red-500">*</span>
          </label>
          <textarea
            v-model="form.excerpt"
            required
            maxlength="200"
            rows="2"
            class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors resize-none"
            placeholder="Descripcion corta para tarjetas y SEO (max 200 caracteres)"
          />
          <p class="mt-1 font-sans text-xs text-brand-olive/40">
            {{ form.excerpt.length }}/200
          </p>
        </div>
      </section>

      <!-- IMAGEN PRINCIPAL -->
      <section>
        <h3 class="font-display uppercase text-brand-olive text-lg mb-4">IMAGEN PRINCIPAL</h3>
        <AdminMultiImageUpload
          ref="imageUploader"
          v-model="heroImages"
          :max-images="1"
          upload-endpoint="/api/upload/product-image"
          folder="blog"
        />
      </section>

      <!-- CONTENIDO -->
      <section>
        <h3 class="font-display uppercase text-brand-olive text-lg mb-4">CONTENIDO</h3>
        <AdminRichTextEditor
          v-model="form.body"
          min-height="300px"
        />
      </section>

      <!-- SEO -->
      <section>
        <h3 class="font-display uppercase text-brand-olive text-lg mb-4">SEO (OPCIONAL)</h3>

        <div class="mb-4">
          <label class="block font-sans text-sm text-brand-olive mb-1">Titulo SEO</label>
          <input
            v-model="form.seoTitle"
            type="text"
            class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
            placeholder="Override para el titulo en buscadores"
          />
        </div>

        <div class="mb-4">
          <label class="block font-sans text-sm text-brand-olive mb-1">Descripcion SEO</label>
          <textarea
            v-model="form.seoDescription"
            rows="2"
            class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors resize-none"
            placeholder="Override para la descripcion en buscadores"
          />
        </div>
      </section>

      <!-- OPCIONES -->
      <section>
        <h3 class="font-display uppercase text-brand-olive text-lg mb-4">OPCIONES</h3>
        <label class="flex items-center gap-2 font-sans text-sm text-brand-olive cursor-pointer">
          <input v-model="form.isPublished" type="checkbox" class="accent-brand-primary" />
          Publicado
        </label>
        <p class="mt-1 font-sans text-xs text-brand-olive/40">
          Si no esta publicado, solo sera visible en el panel de administracion.
        </p>
      </section>

      <!-- Actions -->
      <div class="flex items-center gap-4 pt-4 border-t border-brand-olive/10">
        <button
          type="submit"
          :disabled="saving"
          class="px-6 py-2 bg-brand-primary text-brand-cream font-sans text-sm hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
        >
          {{ saving ? 'Guardando...' : 'Guardar Post' }}
        </button>
        <NuxtLink
          to="/blog"
          class="px-6 py-2 border-2 border-brand-olive/20 font-sans text-sm text-brand-olive hover:border-brand-olive/40 transition-colors"
        >
          Cancelar
        </NuxtLink>
      </div>

      <p v-if="error" class="font-sans text-sm text-red-600 mt-2">{{ error }}</p>
    </form>
  </NuxtLayout>
</template>

<script setup>
import slugify from 'slugify'

const { post } = useApi()
const router = useRouter()

const categories = ['Lanzamiento', 'Proceso', 'Historia', 'Noticia']

const form = ref({
  title: '',
  subtitle: '',
  category: '',
  excerpt: '',
  body: '',
  seoTitle: '',
  seoDescription: '',
  isPublished: false,
})

const heroImages = ref([])
const saving = ref(false)
const error = ref('')

const generatedSlug = computed(() =>
  form.value.title ? slugify(form.value.title, { lower: true, strict: true }) : ''
)

async function handleSubmit() {
  error.value = ''

  if (heroImages.value.length === 0) {
    error.value = 'Imagen principal requerida.'
    return
  }

  saving.value = true

  try {
    const data = {
      ...form.value,
      heroImage: {
        url: heroImages.value[0].url,
        publicId: heroImages.value[0].publicId,
      },
    }

    await post('/api/blog', data)
    router.push({ path: '/blog', query: { toast: `Post "${form.value.title}" creado` } })
  } catch (err) {
    error.value = err.message || 'Error al crear el post'
  } finally {
    saving.value = false
  }
}
</script>
```

- [ ] **Step 2: Install slugify in back-office**

The back-office needs `slugify` for the slug preview. Check if it's already available — if not:

Run: `cd apps/back-office && npm ls slugify`

If not found: `cd apps/back-office && npm install slugify`

Note: slugify is already a dependency in `services/api/`. If it's hoisted by npm workspaces, it may already be available. If so, skip install.

- [ ] **Step 3: Verify the form renders**

Navigate to `/blog/nuevo` in back-office. Expected: Full form with all sections, working category dropdown, image upload area, rich text editor with H2/H3/list buttons.

- [ ] **Step 4: Commit**

```bash
git add apps/back-office/pages/blog/nuevo.vue
git commit -m "feat(back-office): add blog post create form"
```

---

### Task 7: Create blog post edit page

**Files:**
- Create: `apps/back-office/pages/blog/[id].vue`

- [ ] **Step 1: Create the blog edit page**

Create `apps/back-office/pages/blog/[id].vue` following the pattern from `pages/productos/[id].vue`:

```vue
<template>
  <NuxtLayout name="admin">
    <div class="flex items-center justify-between mb-6">
      <h2 class="font-sans text-brand-olive text-2xl font-semibold">Editar Post</h2>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <p class="font-sans text-brand-olive/60 text-sm">Cargando...</p>
    </div>

    <!-- Error -->
    <div v-else-if="loadError" class="text-center py-12">
      <p class="font-sans text-red-600 text-sm">{{ loadError }}</p>
      <NuxtLink to="/blog" class="inline-block mt-4 font-sans text-sm text-brand-primary underline underline-offset-4">
        Volver al listado
      </NuxtLink>
    </div>

    <!-- Form -->
    <form v-else @submit.prevent="handleSubmit" class="max-w-3xl space-y-10">
      <!-- INFORMACION BASICA -->
      <section>
        <h3 class="font-display uppercase text-brand-olive text-lg mb-4">INFORMACION BASICA</h3>

        <div class="mb-4">
          <label class="block font-sans text-sm text-brand-olive mb-1">
            Titulo <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.title"
            type="text"
            required
            class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
          />
          <p v-if="form.title" class="mt-1 font-sans text-xs text-brand-olive/40">
            Slug: {{ generatedSlug }}
          </p>
        </div>

        <div class="mb-4">
          <label class="block font-sans text-sm text-brand-olive mb-1">Subtitulo</label>
          <input
            v-model="form.subtitle"
            type="text"
            class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
          />
        </div>

        <div class="mb-4">
          <label class="block font-sans text-sm text-brand-olive mb-1">
            Categoria <span class="text-red-500">*</span>
          </label>
          <select
            v-model="form.category"
            required
            class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
          >
            <option value="" disabled>Seleccionar categoria</option>
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>

        <div class="mb-4">
          <label class="block font-sans text-sm text-brand-olive mb-1">
            Extracto <span class="text-red-500">*</span>
          </label>
          <textarea
            v-model="form.excerpt"
            required
            maxlength="200"
            rows="2"
            class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors resize-none"
          />
          <p class="mt-1 font-sans text-xs text-brand-olive/40">
            {{ form.excerpt.length }}/200
          </p>
        </div>
      </section>

      <!-- IMAGEN PRINCIPAL -->
      <section>
        <h3 class="font-display uppercase text-brand-olive text-lg mb-4">IMAGEN PRINCIPAL</h3>
        <AdminMultiImageUpload
          ref="imageUploader"
          v-model="heroImages"
          :max-images="1"
          upload-endpoint="/api/upload/product-image"
          folder="blog"
        />
      </section>

      <!-- CONTENIDO -->
      <section>
        <h3 class="font-display uppercase text-brand-olive text-lg mb-4">CONTENIDO</h3>
        <AdminRichTextEditor
          v-model="form.body"
          min-height="300px"
        />
      </section>

      <!-- SEO -->
      <section>
        <h3 class="font-display uppercase text-brand-olive text-lg mb-4">SEO (OPCIONAL)</h3>

        <div class="mb-4">
          <label class="block font-sans text-sm text-brand-olive mb-1">Titulo SEO</label>
          <input
            v-model="form.seoTitle"
            type="text"
            class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
          />
        </div>

        <div class="mb-4">
          <label class="block font-sans text-sm text-brand-olive mb-1">Descripcion SEO</label>
          <textarea
            v-model="form.seoDescription"
            rows="2"
            class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors resize-none"
          />
        </div>
      </section>

      <!-- OPCIONES -->
      <section>
        <h3 class="font-display uppercase text-brand-olive text-lg mb-4">OPCIONES</h3>
        <label class="flex items-center gap-2 font-sans text-sm text-brand-olive cursor-pointer">
          <input v-model="form.isPublished" type="checkbox" class="accent-brand-primary" />
          Publicado
        </label>
        <p class="mt-1 font-sans text-xs text-brand-olive/40">
          Si no esta publicado, solo sera visible en el panel de administracion.
        </p>
      </section>

      <!-- Actions -->
      <div class="flex items-center gap-4 pt-4 border-t border-brand-olive/10">
        <button
          type="submit"
          :disabled="saving"
          class="px-6 py-2 bg-brand-primary text-brand-cream font-sans text-sm hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
        >
          {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
        </button>
        <NuxtLink
          to="/blog"
          class="px-6 py-2 border-2 border-brand-olive/20 font-sans text-sm text-brand-olive hover:border-brand-olive/40 transition-colors"
        >
          Cancelar
        </NuxtLink>
      </div>

      <p v-if="error" class="font-sans text-sm text-red-600 mt-2">{{ error }}</p>

      <!-- DANGER ZONE -->
      <section class="mt-12 pt-8 border-t border-red-200">
        <h3 class="font-display uppercase text-red-600 text-lg mb-4">ZONA PELIGROSA</h3>
        <p class="font-sans text-sm text-brand-olive/60 mb-4">
          Eliminar este post de forma permanente. Esta accion no se puede deshacer.
        </p>
        <button
          type="button"
          class="px-6 py-2 border-2 border-red-300 text-red-600 font-sans text-sm hover:bg-red-50 transition-colors"
          @click="showDeleteModal = true"
        >
          Eliminar Post
        </button>
      </section>
    </form>

    <!-- Delete Modal -->
    <AdminConfirmModal
      :visible="showDeleteModal"
      :loading="deletingPost"
      title="Eliminar post"
      :message="`Se eliminara el post '${form.title}'. Esta accion no se puede deshacer.`"
      @confirm="handleDelete"
      @cancel="showDeleteModal = false"
    />
  </NuxtLayout>
</template>

<script setup>
import slugify from 'slugify'

const { get, put, delete: apiDelete } = useApi()
const route = useRoute()
const router = useRouter()

const categories = ['Lanzamiento', 'Proceso', 'Historia', 'Noticia']

const form = ref({
  title: '',
  subtitle: '',
  category: '',
  excerpt: '',
  body: '',
  seoTitle: '',
  seoDescription: '',
  isPublished: false,
})

const heroImages = ref([])
const loading = ref(true)
const loadError = ref('')
const saving = ref(false)
const error = ref('')
const showDeleteModal = ref(false)
const deletingPost = ref(false)

const generatedSlug = computed(() =>
  form.value.title ? slugify(form.value.title, { lower: true, strict: true }) : ''
)

onMounted(async () => {
  try {
    const post = await get(`/api/blog/admin/${route.params.id}`)

    form.value = {
      title: post.title || '',
      subtitle: post.subtitle || '',
      category: post.category || '',
      excerpt: post.excerpt || '',
      body: post.body || '',
      seoTitle: post.seoTitle || '',
      seoDescription: post.seoDescription || '',
      isPublished: post.isPublished ?? false,
    }

    if (post.heroImage?.url) {
      heroImages.value = [{
        url: post.heroImage.url,
        publicId: post.heroImage.publicId || '',
        order: 0,
      }]
    }
  } catch (err) {
    loadError.value = err.message || 'Error al cargar el post'
  } finally {
    loading.value = false
  }
})

async function handleSubmit() {
  error.value = ''

  if (heroImages.value.length === 0) {
    error.value = 'Imagen principal requerida.'
    return
  }

  saving.value = true

  try {
    const data = {
      ...form.value,
      heroImage: {
        url: heroImages.value[0].url,
        publicId: heroImages.value[0].publicId,
      },
    }

    await put(`/api/blog/${route.params.id}`, data)
    router.push({ path: '/blog', query: { toast: `Post "${form.value.title}" actualizado` } })
  } catch (err) {
    error.value = err.message || 'Error al actualizar el post'
  } finally {
    saving.value = false
  }
}

async function handleDelete() {
  deletingPost.value = true
  try {
    const title = form.value.title
    await apiDelete(`/api/blog/${route.params.id}`)
    router.push({ path: '/blog', query: { toast: `Post "${title}" eliminado` } })
  } catch (err) {
    showDeleteModal.value = false
    error.value = err.message || 'Error al eliminar el post'
  } finally {
    deletingPost.value = false
  }
}
</script>
```

- [ ] **Step 2: Verify the edit page loads**

Create a test post via `/blog/nuevo`, then click "Editar" from the list. Expected: Form pre-populated with all data including body content and hero image.

- [ ] **Step 3: Commit**

```bash
git add apps/back-office/pages/blog/[id].vue
git commit -m "feat(back-office): add blog post edit page"
```

---

## Chunk 3: Storefront

### Task 8: Create dynamic blog post page

**Files:**
- Create: `apps/home/pages/blog/[slug].vue`
- Remove: `apps/home/pages/blog/capsula-raiz.vue`

- [ ] **Step 1: Create the dynamic blog post page**

Create `apps/home/pages/blog/[slug].vue` following the structure of the current `capsula-raiz.vue` but fetching data dynamically:

```vue
<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="container mx-auto px-6 py-20">
      <div class="max-w-3xl mx-auto animate-pulse">
        <div class="h-3 w-48 bg-brand-olive/5 mb-4" />
        <div class="h-3 w-20 bg-brand-olive/5 mb-2" />
        <div class="h-10 w-3/4 bg-brand-olive/5 mb-2" />
        <div class="h-5 w-1/2 bg-brand-olive/5 mb-8" />
        <div class="aspect-[16/9] bg-brand-cream" />
      </div>
    </div>

    <!-- Not found -->
    <div v-else-if="!post" class="container mx-auto px-6 py-20 text-center">
      <h1 class="font-display uppercase text-brand-primary text-3xl">POST NO ENCONTRADO</h1>
      <p class="font-serif text-brand-olive/60 mt-4">El articulo que buscas no existe o fue removido.</p>
      <NuxtLink
        to="/blog"
        class="inline-block mt-6 font-sans text-sm text-brand-primary underline underline-offset-4 hover:text-brand-primary/80 transition-colors duration-200"
      >
        Ver todas las noticias
      </NuxtLink>
    </div>

    <!-- Post -->
    <div v-else>
      <!-- Hero -->
      <section class="bg-brand-cream pt-4 pb-6 md:pt-6 md:pb-8">
        <div class="container mx-auto px-6">
          <div class="max-w-3xl mx-auto">
            <UiBreadcrumb :items="breadcrumbItems" class="mb-4" />
            <span class="font-sans text-xs uppercase tracking-wide text-brand-olive/50">
              {{ post.category }}
            </span>
            <h1 class="font-display uppercase text-brand-primary text-3xl md:text-4xl mt-2">
              {{ post.title }}
            </h1>
            <p v-if="post.subtitle" class="font-serif text-brand-olive/60 text-lg mt-2">
              {{ post.subtitle }}
            </p>
          </div>
        </div>
      </section>

      <!-- Image -->
      <section class="container mx-auto px-6">
        <div class="max-w-3xl mx-auto">
          <div class="aspect-[16/9] overflow-hidden">
            <img
              :src="post.heroImage?.url"
              :alt="post.title"
              class="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      <!-- Article body -->
      <article class="container mx-auto px-6 py-12 md:py-16">
        <div class="max-w-3xl mx-auto prose-article" v-html="post.body" />

        <!-- CTA -->
        <div class="max-w-3xl mx-auto mt-12 pt-8 border-t border-brand-olive/10 text-center">
          <NuxtLink
            to="/productos"
            class="inline-block bg-brand-primary text-brand-cream font-sans text-sm uppercase tracking-widest px-8 py-3 hover:bg-brand-primary/90 transition-colors duration-200"
          >
            EXPLORAR PRODUCTOS
          </NuxtLink>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
const { get } = useApi()
const route = useRoute()

const post = ref(null)
const loading = ref(true)

const breadcrumbItems = computed(() => {
  if (!post.value) return []
  return [
    { label: 'Inicio', to: '/' },
    { label: 'Blog', to: '/blog' },
    { label: post.value.title, to: null },
  ]
})

onMounted(async () => {
  const data = await get(`/api/blog/${route.params.slug}`)
  post.value = data
  loading.value = false
})

useHead({
  title: computed(() => {
    if (!post.value) return 'Blog | El Gran Peon'
    return post.value.seoTitle || `${post.value.title} | El Gran Peon`
  }),
  meta: computed(() => {
    if (!post.value) return []
    const description = post.value.seoDescription || post.value.excerpt
    return [
      { name: 'description', content: description },
      { property: 'og:title', content: post.value.seoTitle || post.value.title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: post.value.heroImage?.url || '' },
    ]
  }),
})
</script>

<style scoped>
.prose-article {
  @apply font-serif text-brand-olive leading-relaxed;
}
.prose-article :deep(p) {
  @apply mb-5;
}
.prose-article :deep(h2) {
  @apply font-display uppercase text-brand-primary text-xl md:text-2xl mt-10 mb-4;
}
.prose-article :deep(h3) {
  @apply font-sans font-semibold text-brand-olive text-base mt-6 mb-2;
}
.prose-article :deep(ul) {
  @apply mb-5 ml-5 space-y-2;
}
.prose-article :deep(ol) {
  @apply mb-5 ml-5 space-y-2 list-decimal;
}
.prose-article :deep(ul > li) {
  @apply list-disc;
}
.prose-article :deep(strong) {
  @apply font-semibold text-brand-olive;
}
</style>
```

Note: The styles use `:deep()` instead of direct selectors because `v-html` content is not scoped. Also added `ol` styling that the original didn't have.

- [ ] **Step 2: Delete the old hardcoded blog post**

Remove: `apps/home/pages/blog/capsula-raiz.vue`

Run: `rm apps/home/pages/blog/capsula-raiz.vue`

- [ ] **Step 3: Commit**

```bash
git add apps/home/pages/blog/[slug].vue
git rm apps/home/pages/blog/capsula-raiz.vue
git commit -m "feat(storefront): add dynamic blog post page, remove hardcoded capsula-raiz"
```

---

### Task 9: Create blog index page on storefront

**Files:**
- Create: `apps/home/pages/blog/index.vue`

- [ ] **Step 1: Create the blog listing page**

Create `apps/home/pages/blog/index.vue`:

```vue
<template>
  <div>
    <section class="bg-brand-cream pt-4 pb-6 md:pt-6 md:pb-8">
      <div class="container mx-auto px-6">
        <div class="max-w-6xl mx-auto">
          <UiBreadcrumb :items="[{ label: 'Inicio', to: '/' }, { label: 'Blog', to: null }]" class="mb-4" />
          <h1 class="font-display uppercase text-brand-primary text-3xl md:text-4xl">
            NOTICIAS E HISTORIAS
          </h1>
          <div class="mt-4 h-px w-12 bg-brand-primary/30" />
        </div>
      </div>
    </section>

    <section class="container mx-auto px-6 py-12 md:py-16">
      <div class="max-w-6xl mx-auto">
        <!-- Loading -->
        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="i in 3" :key="i" class="animate-pulse">
            <div class="aspect-[4/3] bg-brand-cream" />
            <div class="mt-4 h-3 w-20 bg-brand-olive/5" />
            <div class="mt-2 h-5 w-3/4 bg-brand-olive/5" />
            <div class="mt-2 h-12 w-full bg-brand-olive/5" />
          </div>
        </div>

        <!-- Empty -->
        <div v-else-if="posts.length === 0" class="text-center py-12">
          <p class="font-serif text-brand-olive/60">No hay noticias por el momento.</p>
        </div>

        <!-- Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <NuxtLink
            v-for="post in posts"
            :key="post.id"
            :to="`/blog/${post.slug}`"
            class="group block"
          >
            <div class="aspect-[4/3] bg-white border border-brand-olive/10 overflow-hidden">
              <img
                v-if="post.heroImage?.url"
                :src="post.heroImage.url"
                :alt="post.title"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div class="mt-5">
              <span class="font-sans text-xs uppercase tracking-wide text-brand-olive/50">
                {{ post.category }}
              </span>
              <h2 class="font-sans font-medium text-brand-olive text-lg mt-1 group-hover:text-brand-primary transition-colors">
                {{ post.title }}
              </h2>
              <p class="font-serif text-brand-olive/60 text-sm mt-2 leading-relaxed line-clamp-3">
                {{ post.excerpt }}
              </p>
              <span class="inline-block mt-3 font-sans text-sm text-brand-primary border-b border-brand-primary/30 group-hover:border-brand-primary/60 transition-colors">
                Leer mas
              </span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
const { get } = useApi()

const posts = ref([])
const loading = ref(true)

onMounted(async () => {
  const data = await get('/api/blog')
  posts.value = data?.posts || []
  loading.value = false
})

useSeoMeta({
  title: 'Noticias e Historias | El Gran Peon',
  description: 'Noticias, lanzamientos e historias de El Gran Peon. Articulos sobre tradicion, oficio y productos artesanales argentinos.',
  ogTitle: 'Noticias e Historias | El Gran Peon',
  ogDescription: 'Noticias, lanzamientos e historias de El Gran Peon.',
})
</script>
```

- [ ] **Step 2: Verify the page renders**

Navigate to `/blog` on the storefront. Expected: Empty state or grid of posts (depending on whether posts have been created).

- [ ] **Step 3: Commit**

```bash
git add apps/home/pages/blog/index.vue
git commit -m "feat(storefront): add blog listing page"
```

---

### Task 10: Update nosotros.vue to fetch blog posts dynamically

**Files:**
- Modify: `apps/home/pages/nosotros.vue`

- [ ] **Step 1: Replace the hardcoded blog section**

In `apps/home/pages/nosotros.vue`, replace the "Noticias e Historias" section (lines 224-264) with a dynamic version that fetches the latest 3 published posts.

Replace the entire section (from `<!-- Section 6: Noticias y Historias -->` through the closing `</section>` tag) with:

```html
<!-- Section 6: Noticias y Historias -->
<section v-if="blogPosts.length > 0" id="noticias" class="bg-brand-cream py-20 md:py-28 scroll-mt-16">
  <div class="container mx-auto px-6">
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-12">
        <h2 class="font-display uppercase text-brand-primary text-3xl md:text-4xl">
          NOTICIAS E HISTORIAS
        </h2>
        <div class="mx-auto mt-4 h-px w-12 bg-brand-primary/30" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <NuxtLink
          v-for="post in blogPosts"
          :key="post.id"
          :to="`/blog/${post.slug}`"
          class="group block"
        >
          <div class="aspect-[4/3] bg-white border border-brand-olive/10 overflow-hidden">
            <img
              v-if="post.heroImage?.url"
              :src="post.heroImage.url"
              :alt="post.title"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>
          <div class="mt-5">
            <span class="font-sans text-xs uppercase tracking-wide text-brand-olive/50">
              {{ post.category }}
            </span>
            <h3 class="font-sans font-medium text-brand-olive text-lg mt-1 group-hover:text-brand-primary transition-colors">
              {{ post.title }}
            </h3>
            <p class="font-serif text-brand-olive/60 text-sm mt-2 leading-relaxed line-clamp-3">
              {{ post.excerpt }}
            </p>
            <span class="inline-block mt-3 font-sans text-sm text-brand-primary border-b border-brand-primary/30 group-hover:border-brand-primary/60 transition-colors">
              Leer mas
            </span>
          </div>
        </NuxtLink>
      </div>

      <div class="text-center mt-10">
        <NuxtLink
          to="/blog"
          class="inline-block font-sans text-sm text-brand-primary border-b border-brand-primary/30 hover:border-brand-primary/60 transition-colors"
        >
          Ver todas las noticias
        </NuxtLink>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Add data fetching to the script section**

In the `<script setup>` of nosotros.vue, add:

```javascript
const { get } = useApi()
const blogPosts = ref([])

onMounted(async () => {
  const data = await get('/api/blog?limit=3')
  blogPosts.value = data?.posts || []
})
```

Also remove the `capsulaRaizImg` import if it's no longer used by any other section on this page. Check first — if it's used elsewhere (e.g. in the workshop/artesano section), keep it.

- [ ] **Step 3: Verify the section renders**

Navigate to `/nosotros` on the storefront. Expected: Section shows latest 3 blog posts as cards (or is hidden if no posts exist).

- [ ] **Step 4: Commit**

```bash
git add apps/home/pages/nosotros.vue
git commit -m "feat(storefront): make nosotros blog section dynamic with latest 3 posts"
```

---

## Chunk 4: Verification & Cleanup

### Task 11: End-to-end verification

- [ ] **Step 1: Start all three services**

```bash
# Terminal 1
cd services/api && npm run dev

# Terminal 2
cd apps/back-office && npm run dev

# Terminal 3
cd apps/home && npm run dev
```

- [ ] **Step 2: Create a blog post via back-office**

1. Navigate to back-office `/blog`
2. Click "Nuevo Post"
3. Fill in: Title "El Gran Peon presenta la Capsula Raiz", Category "Lanzamiento", excerpt, upload hero image, write body content using the rich text editor (use H2, H3, lists)
4. Check "Publicado"
5. Save

Expected: Redirect to `/blog` with success toast, post appears in list as "Publicado"

- [ ] **Step 3: Verify storefront blog index**

Navigate to storefront `/blog`.
Expected: Grid with the post card showing image, category, title, excerpt.

- [ ] **Step 4: Verify storefront blog post**

Click the post card.
Expected: Dynamic page with hero, title, body rendered with proper `.prose-article` styling, CTA at bottom. URL is `/blog/el-gran-peon-presenta-la-capsula-raiz`.

- [ ] **Step 5: Verify nosotros section**

Navigate to `/nosotros`, scroll to "Noticias e Historias".
Expected: The section shows the post card. "Ver todas las noticias" link works.

- [ ] **Step 6: Verify edit flow**

Go back to back-office `/blog`, click "Editar" on the post.
Expected: Form loads with all data including body and hero image. Make a change, save. Verify change reflects on storefront.

- [ ] **Step 7: Verify draft behavior**

Edit the post, uncheck "Publicado", save. Check storefront — post should no longer appear. Re-publish and confirm it returns.

- [ ] **Step 8: Verify delete flow**

Create a second test post, then delete it from the list or edit page. Confirm it disappears from both back-office and storefront.
