# Product Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add product search to the storefront with an autocomplete dropdown in the header and a dedicated search results page.

**Architecture:** New `GET /api/products/search` endpoint performs server-side case-insensitive search across product name, tags, and category names. Frontend adds a search icon to the header that expands into a full-width search bar with a debounced autocomplete dropdown (categories + products). Pressing Enter navigates to a `/buscar` results page.

**Tech Stack:** Express.js (API), Nuxt 3 (frontend), Tailwind CSS, existing `useApi` composable, existing `cache` utility.

---

### Task 1: API Search Endpoint

**Files:**
- Create: `services/api/src/controllers/searchController.js`
- Modify: `services/api/src/routes/products.js:1-23`

- [ ] **Step 1: Create the search controller**

Create `services/api/src/controllers/searchController.js`:

```js
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
```

- [ ] **Step 2: Register the route**

Modify `services/api/src/routes/products.js`. Add the import and route **before** the `/:idOrSlug` route (otherwise Express matches "search" as an idOrSlug param):

```js
import {
  listActiveProducts,
  listAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  reorderFeatured,
  deleteProduct,
} from '../controllers/productController.js';
import { searchProducts } from '../controllers/searchController.js';

const router = Router();

router.get('/', listActiveProducts);
router.get('/search', searchProducts);
router.get('/all', requireAuth, listAllProducts);
router.patch('/reorder-featured', requireAuth, reorderFeatured);
router.get('/:idOrSlug', getProduct);
router.post('/', requireAuth, createProduct);
router.put('/:id', requireAuth, updateProduct);
router.delete('/:id', requireAuth, deleteProduct);
```

- [ ] **Step 3: Manually test the endpoint**

Run: `curl "http://localhost:3001/api/products/search?q=mate&limit=5&categoryLimit=3"`

Expected: JSON response with `{ products: [...], categories: [...] }` containing matching results.

Also test edge cases:
- `curl "http://localhost:3001/api/products/search?q=a"` → `{ products: [], categories: [] }` (too short)
- `curl "http://localhost:3001/api/products/search?q=xyznothing"` → `{ products: [], categories: [] }`

- [ ] **Step 4: Commit**

```bash
git add services/api/src/controllers/searchController.js services/api/src/routes/products.js
git commit -m "feat(api): add product search endpoint"
```

---

### Task 2: SearchBar Component (Expandable)

**Files:**
- Create: `apps/home/components/SearchBar.vue`

- [ ] **Step 1: Create the SearchBar component**

Create `apps/home/components/SearchBar.vue`:

```vue
<template>
  <div class="relative" ref="searchContainer">
    <!-- Expanded Search Bar -->
    <Transition name="search-expand">
      <div
        v-if="isOpen"
        class="absolute top-0 left-0 right-0 bg-brand-cream border-b border-brand-olive/10 z-50"
      >
        <div class="container mx-auto px-6 py-3">
          <div class="flex items-center gap-3">
            <svg class="w-5 h-5 text-brand-olive/50 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" stroke-width="1.5" />
              <path stroke-linecap="round" stroke-width="1.5" d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref="searchInput"
              v-model="query"
              type="text"
              placeholder="Buscar productos..."
              class="flex-1 bg-transparent font-sans text-sm text-brand-olive placeholder:text-brand-olive/40 outline-none"
              @keydown.enter="goToResults"
              @keydown.escape="close"
            />
            <button
              @click="close"
              class="text-brand-olive/50 hover:text-brand-olive transition-colors p-1"
              aria-label="Cerrar búsqueda"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="square" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Autocomplete Dropdown -->
        <div
          v-if="showDropdown"
          class="border-t border-brand-olive/10 bg-brand-cream"
        >
          <div class="container mx-auto px-6 py-4 max-h-[70vh] overflow-y-auto">
            <!-- Loading -->
            <div v-if="loading" class="py-4 text-center">
              <span class="font-sans text-sm text-brand-olive/50">Buscando...</span>
            </div>

            <!-- Results -->
            <template v-else>
              <!-- Categories Section -->
              <div v-if="results.categories.length > 0" class="mb-4">
                <p class="font-sans text-xs uppercase tracking-wide text-brand-olive/50 mb-2">Categorías</p>
                <NuxtLink
                  v-for="cat in results.categories"
                  :key="cat.id"
                  :to="categoryUrl(cat)"
                  class="flex items-center gap-2 py-2 px-2 hover:bg-brand-olive/5 transition-colors"
                  @click="close"
                >
                  <svg class="w-4 h-4 text-brand-olive/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-width="1.5" d="M3 7h18M3 12h18M3 17h18" />
                  </svg>
                  <span class="font-sans text-sm text-brand-olive">
                    {{ cat.name }}
                    <span v-if="cat.parentName" class="text-brand-olive/40">en {{ cat.parentName }}</span>
                  </span>
                </NuxtLink>
              </div>

              <!-- Products Section -->
              <div v-if="results.products.length > 0">
                <p class="font-sans text-xs uppercase tracking-wide text-brand-olive/50 mb-2">Productos</p>
                <NuxtLink
                  v-for="product in results.products"
                  :key="product.id"
                  :to="`/productos/${product.slug}`"
                  class="flex items-center gap-3 py-2 px-2 hover:bg-brand-olive/5 transition-colors"
                  @click="close"
                >
                  <div class="w-10 h-10 bg-brand-cream border border-brand-olive/10 shrink-0 overflow-hidden">
                    <img
                      v-if="product.images && product.images.length"
                      :src="optimizedUrl(product.images[0].url, { width: 80 })"
                      :alt="product.name"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-sans text-sm text-brand-olive truncate">{{ product.name }}</p>
                    <p v-if="product.categoryName" class="font-sans text-xs text-brand-olive/50">{{ product.categoryName }}</p>
                  </div>
                  <span v-if="product.price" class="font-sans text-sm font-semibold text-brand-primary shrink-0">
                    {{ formatPrice(product.price) }}
                  </span>
                  <span v-else class="font-sans text-xs text-brand-olive/50 shrink-0">Consultar</span>
                </NuxtLink>
              </div>

              <!-- No Results -->
              <div v-if="results.categories.length === 0 && results.products.length === 0 && query.length >= 2" class="py-4 text-center">
                <p class="font-sans text-sm text-brand-olive/50">No se encontraron resultados para "{{ query }}"</p>
              </div>

              <!-- View All Results Link -->
              <div v-if="results.products.length > 0 || results.categories.length > 0" class="mt-3 pt-3 border-t border-brand-olive/10">
                <button
                  @click="goToResults"
                  class="w-full font-sans text-xs uppercase tracking-wide text-brand-primary hover:text-brand-primary/80 transition-colors py-2"
                >
                  Ver todos los resultados
                </button>
              </div>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { formatPrice } from '~/utils/format'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])

const router = useRouter()
const { get } = useApi()
const { optimizedUrl } = useCloudinaryUrl()

const query = ref('')
const results = ref({ products: [], categories: [] })
const loading = ref(false)
const searchInput = ref(null)
const searchContainer = ref(null)

let debounceTimer = null

const showDropdown = computed(() => query.value.length >= 2)

watch(() => props.isOpen, async (open) => {
  if (open) {
    await nextTick()
    searchInput.value?.focus()
  } else {
    query.value = ''
    results.value = { products: [], categories: [] }
  }
})

watch(query, (val) => {
  clearTimeout(debounceTimer)
  if (val.length < 2) {
    results.value = { products: [], categories: [] }
    return
  }
  loading.value = true
  debounceTimer = setTimeout(() => search(val), 300)
})

async function search(q) {
  const data = await get(`/api/products/search?q=${encodeURIComponent(q)}&limit=5&categoryLimit=3`)
  if (data) {
    results.value = data
  }
  loading.value = false
}

function categoryUrl(cat) {
  if (cat.parentId) {
    return `/productos?categoria=${cat.slug}`
  }
  return `/productos?categoria=${cat.slug}`
}

function goToResults() {
  if (query.value.trim().length < 2) return
  router.push(`/buscar?q=${encodeURIComponent(query.value.trim())}`)
  close()
}

function close() {
  emit('close')
}

function handleClickOutside(e) {
  if (props.isOpen && searchContainer.value && !searchContainer.value.contains(e.target)) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  clearTimeout(debounceTimer)
})
</script>

<style scoped>
.search-expand-enter-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.search-expand-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.search-expand-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.search-expand-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add apps/home/components/SearchBar.vue
git commit -m "feat(home): add SearchBar component with autocomplete"
```

---

### Task 3: Integrate Search Icon into SiteHeader

**Files:**
- Modify: `apps/home/components/SiteHeader.vue`

- [ ] **Step 1: Add search state and icon to the desktop header**

In `SiteHeader.vue`, add a `searchOpen` ref in the `<script setup>` section:

```js
const searchOpen = ref(false)
```

In the desktop header's right section (the `<div class="flex items-center gap-4">` around line 34), add a search icon button **before** the cart `<div class="relative">`:

```html
<button
  @click="searchOpen = true"
  class="text-brand-olive hover:text-brand-primary transition-colors"
  aria-label="Buscar productos"
>
  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" stroke-width="1.5" />
    <path stroke-linecap="round" stroke-width="1.5" d="m21 21-4.35-4.35" />
  </svg>
</button>
```

- [ ] **Step 2: Add search icon to the mobile header**

In the mobile header's right section (the `<div class="flex items-center gap-1">` around line 93), add the search icon **before** the cart NuxtLink:

```html
<button
  @click="searchOpen = true"
  class="text-brand-olive hover:text-brand-primary transition-colors p-2"
  aria-label="Buscar productos"
>
  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" stroke-width="1.5" />
    <path stroke-linecap="round" stroke-width="1.5" d="m21 21-4.35-4.35" />
  </svg>
</button>
```

- [ ] **Step 3: Add the SearchBar component to the header template**

Place it right after the closing `</div>` of `<div class="container mx-auto px-6">` (line 118), before the mobile menu overlay `<Transition>`:

```html
<!-- Search Bar -->
<SearchBar :is-open="searchOpen" @close="searchOpen = false" />
```

- [ ] **Step 4: Verify visually**

Run: `npm run dev:home` (or the dev server if already running)

Check:
1. Desktop: search icon appears next to cart icon in header
2. Mobile: search icon appears next to cart icon
3. Clicking icon opens the expandable search bar below header
4. Typing 2+ characters shows autocomplete results
5. ESC or X button closes the bar
6. Clicking a product navigates to product detail
7. Clicking a category navigates to products filtered by category
8. Pressing Enter navigates to `/buscar?q=...`

- [ ] **Step 5: Commit**

```bash
git add apps/home/components/SiteHeader.vue
git commit -m "feat(home): integrate search icon into header"
```

---

### Task 4: Search Results Page

**Files:**
- Create: `apps/home/pages/buscar.vue`

- [ ] **Step 1: Create the search results page**

Create `apps/home/pages/buscar.vue`:

```vue
<template>
  <div class="container mx-auto px-4 md:px-6 pt-4 pb-10 md:pt-6 md:pb-16">
    <!-- Breadcrumb -->
    <UiBreadcrumb :items="breadcrumbItems" />

    <!-- Page title -->
    <h1 class="font-display text-brand-primary text-3xl md:text-4xl mt-4">
      RESULTADOS DE BÚSQUEDA
    </h1>

    <p v-if="query" class="font-sans text-sm text-brand-olive/60 mt-2">
      {{ totalResults }} resultado{{ totalResults !== 1 ? 's' : '' }} para "{{ query }}"
    </p>

    <!-- Loading -->
    <div v-if="loading" class="mt-8">
      <UiSkeletonGrid :count="6" />
    </div>

    <!-- Results Grid -->
    <div v-else-if="products.length > 0" class="mt-8">
      <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <ProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
          :show-actions="true"
          :compact-actions="true"
          @add-to-cart="addToCart"
        />
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="query && !loading" class="mt-16 text-center">
      <p class="font-sans text-brand-olive/60">
        No encontramos productos para "{{ query }}"
      </p>
      <p class="font-sans text-sm text-brand-olive/40 mt-2">
        Intentá con otro término o explorá nuestras categorías
      </p>
      <NuxtLink
        to="/productos"
        class="inline-block mt-6 font-sans text-xs uppercase tracking-wide border-2 border-brand-primary text-brand-primary px-6 py-2 hover:bg-brand-primary hover:text-brand-cream transition-colors"
      >
        Ver todos los productos
      </NuxtLink>
    </div>

    <!-- No query -->
    <div v-else class="mt-16 text-center">
      <p class="font-sans text-brand-olive/60">
        Escribí un término para buscar productos
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { formatPrice } from '~/utils/format'

const route = useRoute()
const { get } = useApi()
const cart = useCartStore()

const query = computed(() => route.query.q || '')
const products = ref([])
const loading = ref(false)
const totalResults = computed(() => products.value.length)

const breadcrumbItems = computed(() => [
  { label: 'Inicio', to: '/' },
  { label: query.value ? `Búsqueda: ${query.value}` : 'Búsqueda' },
])

async function search(q) {
  if (!q || q.length < 2) {
    products.value = []
    return
  }
  loading.value = true
  const data = await get(`/api/products/search?q=${encodeURIComponent(q)}&limit=50&categoryLimit=0`)
  if (data && data.products) {
    products.value = data.products
  } else {
    products.value = []
  }
  loading.value = false
}

function addToCart(product) {
  if (product.stock === 0) return
  cart.addProduct(product, 1, [])
}

// Search on mount and when query changes
watch(query, (val) => search(val), { immediate: true })

useHead({
  title: computed(() => query.value ? `Buscar: ${query.value}` : 'Buscar'),
})
</script>
```

- [ ] **Step 2: Verify visually**

Check:
1. Navigate to `/buscar?q=mate` — shows matching products in a grid
2. Navigate to `/buscar?q=xyznothing` — shows empty state with "Ver todos los productos" link
3. Navigate to `/buscar` (no query) — shows "Escribí un término" message
4. Clicking "Ver todos los productos" navigates to `/productos`
5. "AGREGAR AL CARRITO" button works on search results

- [ ] **Step 3: Commit**

```bash
git add apps/home/pages/buscar.vue
git commit -m "feat(home): add search results page at /buscar"
```

---

### Task 5: Final Integration & Polish

**Files:**
- Modify: `apps/home/components/SiteHeader.vue` (minor tweak if needed)
- Modify: `apps/home/components/SearchBar.vue` (minor tweak if needed)

- [ ] **Step 1: Ensure search bar closes on route change**

In `SearchBar.vue`, add a route watcher to auto-close when navigating:

```js
const route = useRoute()

watch(() => route.fullPath, () => {
  if (props.isOpen) {
    close()
  }
})
```

- [ ] **Step 2: Add keyboard shortcut (optional UX polish)**

In `SiteHeader.vue`, add a global keyboard listener for Ctrl+K / Cmd+K to open search:

In the `<script setup>` section, add within `onMounted`:

```js
function handleKeydown(e) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    searchOpen.value = true
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('keydown', handleKeydown)
})
```

- [ ] **Step 3: Full end-to-end manual test**

Test the complete flow:
1. Open storefront → search icon visible in header (desktop + mobile)
2. Click search icon → bar expands, input focused
3. Type "bo" → after 300ms, see autocomplete with matching categories and products
4. Click a product → navigates to detail, search closes
5. Open search again, type "mate", press Enter → lands on `/buscar?q=mate` with results grid
6. Press Cmd+K → search opens from anywhere
7. Press Escape → search closes
8. Click outside search → search closes
9. Test on mobile viewport: hamburger menu still works, search icon accessible

- [ ] **Step 4: Commit**

```bash
git add apps/home/components/SearchBar.vue apps/home/components/SiteHeader.vue
git commit -m "feat(home): polish search with route-close and keyboard shortcut"
```
