# Blog Management System - Design Spec

## Overview

Add a blog management system that lets the client create, edit, and publish blog posts from the back-office. Posts render on the storefront with consistent brand styling and contribute to SEO.

## Data Model

Firestore collection: `blog-posts`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | yes | Post title, rendered as H1 on storefront |
| `subtitle` | string | no | Short line displayed below the title |
| `slug` | string | yes | Auto-generated from title, URL-friendly, unique |
| `category` | string | yes | One of: `Lanzamiento`, `Proceso`, `Historia`, `Noticia` |
| `heroImage` | object | yes | `{ url: string, publicId: string }` from Cloudinary |
| `body` | string | yes | HTML content from TipTap editor |
| `excerpt` | string | yes | Short description for cards and SEO, max 200 chars |
| `seoTitle` | string | no | Optional override for `<title>` meta tag |
| `seoDescription` | string | no | Optional override for meta description |
| `isPublished` | boolean | yes | Draft/published toggle, defaults to `false` |
| `publishedAt` | timestamp | no | Date displayed on post. Logic: on create with `isPublished: true`, set to `now`. On update transitioning from unpublished to published, set to `now`. Once set, never reset (unpublishing keeps the original date for re-publishing). |
| `createdAt` | timestamp | yes | Auto-set on creation |
| `updatedAt` | timestamp | yes | Auto-set on every update |

### Slug Generation

Same approach as products: slugify the title (lowercase, replace spaces with hyphens, strip special characters). Must be unique within the collection. On collision, append numeric suffix (e.g., `capsula-raiz-2`). The API checks for existing slugs before saving and auto-increments the suffix.

### Category Labels

Predefined set, not user-editable:

- **Lanzamiento** - new product/collection launches
- **Proceso** - behind-the-scenes, how things are made
- **Historia** - brand story, heritage, traditions
- **Noticia** - general news, events, announcements

## API

New routes under `/api/blog`. Same controller/route pattern as products and categories.

### Public Endpoints

- `GET /api/blog` - returns published posts sorted by `publishedAt` desc. Supports `?limit=N` query param (used by nosotros to fetch 3). Excludes `body` field from list response for performance.
- `GET /api/blog/:slug` - single post by slug (published only), returns all fields including `body`

### Protected Endpoints (x-api-key)

- `GET /api/blog/all` - returns all posts (including drafts) for back-office. Declared before `/:slug` route to avoid Express matching "all" as a slug parameter.
- `POST /api/blog` - create post
- `PUT /api/blog/:id` - update post
- `DELETE /api/blog/:id` - delete post (also deletes hero image from Cloudinary)

### Request/Response

**Create/Update body:**
```json
{
  "title": "string",
  "subtitle": "string",
  "category": "Lanzamiento",
  "heroImage": { "url": "string", "publicId": "string" },
  "body": "<p>HTML content</p>",
  "excerpt": "string",
  "seoTitle": "string",
  "seoDescription": "string",
  "isPublished": false
}
```

**List response** (excludes `body`, `seoTitle`, `seoDescription` for performance):
```json
{
  "posts": [
    {
      "id": "string",
      "title": "string",
      "subtitle": "string",
      "slug": "string",
      "category": "Lanzamiento",
      "heroImage": { "url": "string", "publicId": "string" },
      "excerpt": "string",
      "isPublished": true,
      "publishedAt": "2026-03-16T00:00:00Z",
      "createdAt": "2026-03-16T00:00:00Z"
    }
  ]
}
```

## Back-Office Changes

### RichTextEditor Enhancement

Extend the existing `AdminRichTextEditor` component. Currently only Bold and Italic are enabled; the rest of StarterKit is explicitly disabled.

**Enable these extensions:**
- `heading` (levels 2 and 3 only - H1 is the title field)
- `bulletList`
- `orderedList`
- `listItem`

**Add toolbar buttons:**
- H2 button
- H3 button
- Bullet list button
- Ordered list button

The editor already outputs HTML via `editor.getHTML()`. No change needed to the output format.

**Editor styles:** Add styles for the new elements inside `.rich-editor .tiptap` so they render visually in the editor (h2, h3 sizing/color, ul/ol with list styles and padding).

**Important:** This change affects the product description field too, which also uses this component. The additional toolbar buttons will appear there as well. This is acceptable since product descriptions could also benefit from lists and headings.

### Navigation

Add "Blog" to the admin navigation bar in `layouts/admin.vue`. Position it after "Suscriptores":

```
Dashboard | Productos | Categorias | Pedidos | Compras | Rentabilidad | Promo Codes | Suscriptores | Blog
```

### New Pages

**`/blog/index.vue`** - Blog post list
- Table with columns: Title, Category, Status (published/draft badge), Date, Actions
- "Nuevo Post" button linking to `/blog/nuevo`
- Edit button per row linking to `/blog/[id]`
- Delete button with ConfirmModal
- Same list styling as productos/categorias pages

**`/blog/nuevo.vue`** - Create blog post
- Structured form following ProductForm patterns:
  - **Section: Informacion basica**
    - Title (text input, required)
    - Subtitle (text input, optional)
    - Slug (auto-generated, displayed read-only)
    - Category (dropdown select from predefined list, required)
    - Excerpt (textarea, max 200 chars, required)
  - **Section: Imagen Principal**
    - AdminMultiImageUpload component with `max-images="1"` (returns `{ url, publicId }` needed for Cloudinary cleanup on delete)
    - Upload endpoint: `/api/upload/product-image`
    - Folder: `blog` (images stored under `el-gran-peon/products/blog/` in Cloudinary — acceptable, avoids new upload route)
  - **Section: Contenido**
    - AdminRichTextEditor (enhanced with H2, H3, lists)
    - Minimum height: 300px (taller than product description)
  - **Section: SEO (optional)**
    - SEO Title (text input)
    - SEO Description (textarea)
  - **Section: Opciones**
    - Published toggle (checkbox, default unchecked)
- Save button posts to API
- Success toast and redirect to `/blog`

**`/blog/[id].vue`** - Edit blog post
- Same form as nuevo, pre-populated with existing data
- Delete section at bottom (same pattern as product edit page)
- Save updates via PUT

### Form Styling

All inputs follow existing back-office conventions:
- `px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors`
- Section headers: `font-display uppercase text-brand-olive text-lg mb-4` (matches ProductForm convention)
- No rounded corners, no shadows

## Storefront Changes

### Dynamic Blog Post Page

**`apps/home/pages/blog/[slug].vue`** - replaces hardcoded `capsula-raiz.vue`

- Fetches post by slug from `GET /api/blog/:slug`
- 404 if not found or not published
- Layout structure (identical to current capsula-raiz):
  - Breadcrumb: Inicio > Blog > {title}
  - Hero section: category label + H1 title + subtitle
  - Hero image (full width within max-w-3xl)
  - Body HTML rendered with `v-html` inside `.prose-article` container
  - CTA section at bottom linking to `/productos`
- SEO meta from post fields (seoTitle/seoDescription with fallbacks to title/excerpt)
- OG image from heroImage URL

### Blog Index Page

**`apps/home/pages/blog/index.vue`**

- Fetches all published posts from `GET /api/blog`
- Breadcrumb: Inicio > Blog
- Page title: "NOTICIAS E HISTORIAS"
- Grid of post cards (1 col mobile, 2 col tablet, 3 col desktop)
- Each card: hero image, category label, title, excerpt (line-clamp-3), "Leer mas" link
- Same card styling as the current nosotros section
- SEO meta for the blog index page

### Nosotros Section Update

Replace the hardcoded single card in "Noticias e Historias" section (`nosotros.vue` lines 224-264):

- Fetch latest 3 published posts from `GET /api/blog?limit=3`
- Render as responsive grid (1 col mobile, 3 col desktop)
- Each card same styling as current
- Add "Ver todas las noticias" link to `/blog` below the grid
- If no posts exist, hide the section entirely

### Migration

- Remove `apps/home/pages/blog/capsula-raiz.vue`
- The "Capsula Raiz" post will be recreated via the back-office after the system is built
- Remove the hardcoded `capsulaRaizImg` import from `nosotros.vue`

## File Changes Summary

### New Files
- `services/api/src/routes/blog.js` - API routes
- `services/api/src/controllers/blog.js` - Business logic
- `apps/back-office/pages/blog/index.vue` - Post list
- `apps/back-office/pages/blog/nuevo.vue` - Create post
- `apps/back-office/pages/blog/[id].vue` - Edit post
- `apps/home/pages/blog/index.vue` - Blog listing (storefront)
- `apps/home/pages/blog/[slug].vue` - Dynamic post page (storefront)

### Modified Files
- `apps/back-office/components/admin/RichTextEditor.vue` - Enable H2, H3, lists
- `apps/back-office/layouts/admin.vue` - Add Blog nav item
- `apps/home/pages/nosotros.vue` - Dynamic blog cards
- `services/api/src/index.js` - Register blog routes

### Removed Files
- `apps/home/pages/blog/capsula-raiz.vue` - Replaced by dynamic `[slug].vue`
