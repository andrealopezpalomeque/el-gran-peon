<template>
  <div class="container mx-auto px-4 md:px-6 py-10 md:py-16">
    <!-- Breadcrumb -->
    <UiBreadcrumb :items="breadcrumbItems" />

    <!-- Page title -->
    <h1 class="font-display text-brand-primary text-3xl md:text-4xl mt-4">
      PRODUCTOS
    </h1>

    <!-- Mobile: Horizontal category pills -->
    <div class="mt-6 md:hidden">
      <div class="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        <button
          class="shrink-0 font-sans text-xs uppercase tracking-wide px-4 py-2 border transition-colors duration-200"
          :class="!activeCategory ? 'border-brand-primary text-brand-primary bg-brand-primary/5' : 'border-brand-olive/20 text-brand-olive/60'"
          @click="clearFilter"
        >
          Todos
        </button>
        <button
          v-for="parent in categories"
          :key="parent.id"
          class="shrink-0 font-sans text-xs uppercase tracking-wide px-4 py-2 border transition-colors duration-200"
          :class="isParentActive(parent) ? 'border-brand-primary text-brand-primary bg-brand-primary/5' : 'border-brand-olive/20 text-brand-olive/60'"
          @click="toggleMobileParent(parent)"
        >
          {{ parent.name }}
        </button>
      </div>
      <!-- Mobile: expanded children -->
      <div v-if="expandedMobileParent" class="flex gap-2 overflow-x-auto pb-2 mt-2 -mx-4 px-4 scrollbar-hide">
        <button
          class="shrink-0 font-sans text-xs tracking-wide px-3 py-1.5 border transition-colors duration-200"
          :class="activeCategory === expandedMobileParent.slug ? 'border-brand-primary text-brand-primary' : 'border-brand-olive/15 text-brand-olive/50'"
          @click="filterByCategory(expandedMobileParent.slug, true)"
        >
          Todo {{ expandedMobileParent.name }}
        </button>
        <button
          v-for="child in expandedMobileParent.children"
          :key="child.id"
          class="shrink-0 font-sans text-xs tracking-wide px-3 py-1.5 border transition-colors duration-200"
          :class="activeCategory === child.slug ? 'border-brand-primary text-brand-primary' : 'border-brand-olive/15 text-brand-olive/50'"
          @click="filterByCategory(child.slug, false)"
        >
          {{ child.name }}
        </button>
      </div>
    </div>

    <div class="mt-8 md:mt-10 flex gap-10">
      <!-- Desktop: Sidebar category filter -->
      <aside class="hidden md:block w-56 shrink-0">
        <nav>
          <button
            class="block w-full text-left font-sans text-sm py-2 transition-colors duration-200"
            :class="!activeCategory ? 'text-brand-primary font-semibold' : 'text-brand-olive/70 hover:text-brand-primary'"
            @click="clearFilter"
          >
            Todos los productos
          </button>
          <div v-for="parent in categories" :key="parent.id" class="mt-4">
            <button
              class="block w-full text-left font-sans text-sm font-semibold uppercase tracking-wide py-1 transition-colors duration-200"
              :class="activeCategory === parent.slug ? 'text-brand-primary' : 'text-brand-olive hover:text-brand-primary'"
              @click="filterByCategory(parent.slug, true)"
            >
              {{ parent.name }}
            </button>
            <div v-if="parent.children && parent.children.length" class="ml-4 mt-1">
              <button
                v-for="child in parent.children"
                :key="child.id"
                class="block w-full text-left font-sans text-sm py-1 transition-colors duration-200"
                :class="activeCategory === child.slug ? 'text-brand-primary font-medium' : 'text-brand-olive/60 hover:text-brand-primary'"
                @click="filterByCategory(child.slug, false)"
              >
                {{ child.name }}
              </button>
            </div>
          </div>
        </nav>
      </aside>

      <!-- Main content -->
      <div class="flex-1 min-w-0">
        <!-- Sort bar -->
        <div class="flex items-center justify-between mb-6">
          <p class="font-sans text-sm text-brand-olive/50">
            <template v-if="!loading">
              {{ products.length }} {{ products.length === 1 ? 'producto' : 'productos' }}
            </template>
          </p>
          <div class="relative">
            <select
              v-model="sortBy"
              class="font-sans text-sm text-brand-olive bg-transparent border border-brand-olive/20 px-3 py-2 pr-8 appearance-none cursor-pointer focus:outline-none focus:border-brand-primary"
            >
              <option value="relevancia">Relevancia</option>
              <option value="precio-asc">Precio: menor a mayor</option>
              <option value="precio-desc">Precio: mayor a menor</option>
              <option value="recientes">Más recientes</option>
            </select>
            <svg class="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-olive/40 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <!-- Loading skeleton -->
        <UiSkeletonGrid v-if="loading" :count="6" />

        <!-- Product grid -->
        <div v-else-if="sortedProducts.length" class="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <ProductCard
            v-for="product in sortedProducts"
            :key="product.id"
            :product="product"
          />
        </div>

        <!-- Empty state -->
        <div v-else class="text-center py-20">
          <p class="font-serif text-brand-olive/60 text-lg">
            No hay productos en esta categoría.
          </p>
          <button
            class="mt-4 font-sans text-sm text-brand-primary underline underline-offset-4 hover:text-brand-primary/80 transition-colors duration-200"
            @click="clearFilter"
          >
            Ver todos los productos
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const route = useRoute()
const router = useRouter()
const { get } = useApi()

const categories = ref([])
const products = ref([])
const loading = ref(true)
const sortBy = ref('relevancia')
const activeCategory = ref(null)
const isParentFilter = ref(false)
const expandedMobileParent = ref(null)

// Find the active category object for breadcrumb
const activeCategoryData = computed(() => {
  if (!activeCategory.value) return null
  for (const parent of categories.value) {
    if (parent.slug === activeCategory.value) return { ...parent, isParent: true }
    if (parent.children) {
      for (const child of parent.children) {
        if (child.slug === activeCategory.value) return { ...child, isParent: false, parent }
      }
    }
  }
  return null
})

const breadcrumbItems = computed(() => {
  const items = [
    { label: 'Inicio', to: '/' },
  ]
  if (activeCategoryData.value) {
    items.push({ label: 'Productos', to: '/productos' })
    if (!activeCategoryData.value.isParent && activeCategoryData.value.parent) {
      items.push({
        label: activeCategoryData.value.parent.name,
        to: `/productos?categoria=${activeCategoryData.value.parent.slug}`,
      })
    }
    items.push({ label: activeCategoryData.value.name, to: null })
  } else {
    items.push({ label: 'Productos', to: null })
  }
  return items
})

const sortedProducts = computed(() => {
  const list = [...products.value]
  switch (sortBy.value) {
    case 'precio-asc':
      return list.sort((a, b) => a.price - b.price)
    case 'precio-desc':
      return list.sort((a, b) => b.price - a.price)
    case 'recientes':
      return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    default:
      return list
  }
})

function isParentActive(parent) {
  if (activeCategory.value === parent.slug) return true
  if (parent.children) {
    return parent.children.some(c => c.slug === activeCategory.value)
  }
  return false
}

function toggleMobileParent(parent) {
  if (expandedMobileParent.value?.id === parent.id) {
    // Already expanded — filter by this parent
    filterByCategory(parent.slug, true)
    return
  }
  expandedMobileParent.value = parent
  filterByCategory(parent.slug, true)
}

function filterByCategory(slug, parentFilter) {
  activeCategory.value = slug
  isParentFilter.value = parentFilter
  router.replace({ query: { categoria: slug } })
}

function clearFilter() {
  activeCategory.value = null
  isParentFilter.value = false
  expandedMobileParent.value = null
  router.replace({ query: {} })
}

async function fetchProducts() {
  loading.value = true
  let endpoint = '/api/products'
  const params = []

  if (activeCategory.value) {
    if (isParentFilter.value) {
      params.push(`parentCategory=${activeCategory.value}`)
    } else {
      params.push(`category=${activeCategory.value}`)
    }
  }

  if (params.length) {
    endpoint += '?' + params.join('&')
  }

  const data = await get(endpoint)
  products.value = data || []
  loading.value = false
}

async function fetchCategories() {
  const data = await get('/api/categories')
  if (data) {
    categories.value = data.filter(cat => !cat.parentId)
  }
}

// Determine if a slug is a parent category
function resolveCategory(slug) {
  for (const parent of categories.value) {
    if (parent.slug === slug) return { isParent: true }
    if (parent.children) {
      for (const child of parent.children) {
        if (child.slug === slug) return { isParent: false, parent }
      }
    }
  }
  return { isParent: true } // default to parent filter if unknown
}

watch(() => route.query.categoria, async (newVal) => {
  if (newVal) {
    const resolved = resolveCategory(newVal)
    activeCategory.value = newVal
    isParentFilter.value = resolved.isParent
    // Update mobile expanded parent
    if (resolved.isParent) {
      expandedMobileParent.value = categories.value.find(c => c.slug === newVal) || null
    } else if (resolved.parent) {
      expandedMobileParent.value = resolved.parent
    }
  } else {
    activeCategory.value = null
    isParentFilter.value = false
    expandedMobileParent.value = null
  }
  await fetchProducts()
})

onMounted(async () => {
  await fetchCategories()

  // Read initial query param
  const catSlug = route.query.categoria
  if (catSlug) {
    const resolved = resolveCategory(catSlug)
    activeCategory.value = catSlug
    isParentFilter.value = resolved.isParent
    if (resolved.isParent) {
      expandedMobileParent.value = categories.value.find(c => c.slug === catSlug) || null
    } else if (resolved.parent) {
      expandedMobileParent.value = resolved.parent
    }
  }

  await fetchProducts()
})

useHead({
  title: computed(() => {
    if (activeCategoryData.value) {
      return `${activeCategoryData.value.name} | Productos | El Gran Peón`
    }
    return 'Productos | El Gran Peón'
  }),
  meta: [
    { name: 'description', content: 'Explorá nuestra colección de mates, bombillas, cuchillos y artículos de campo. Hecho para durar.' },
  ],
})
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
