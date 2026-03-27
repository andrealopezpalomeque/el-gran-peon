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

const route = useRoute()

watch(() => route.fullPath, () => {
  if (props.isOpen) {
    close()
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
