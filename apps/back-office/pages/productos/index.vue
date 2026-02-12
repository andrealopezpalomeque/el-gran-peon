<template>
  <NuxtLayout name="admin">
    <div class="flex items-center justify-between mb-6">
      <h2 class="font-sans text-brand-olive text-2xl font-semibold">Productos</h2>
      <NuxtLink
        to="/productos/nuevo"
        class="px-5 py-2 bg-brand-primary text-brand-cream font-sans text-sm font-medium hover:bg-brand-primary/90 transition-colors"
      >
        Nuevo Producto
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap items-center gap-4 mb-6 pb-4 border-b-2 border-brand-olive/10">
      <div>
        <select
          v-model="filterCategory"
          class="px-3 py-1.5 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
        >
          <option value="">Todas las categorias</option>
          <option v-for="cat in flatCategories" :key="cat.id" :value="cat.id">
            {{ cat.label }}
          </option>
        </select>
      </div>

      <label class="flex items-center gap-2 cursor-pointer">
        <input v-model="filterFeatured" type="checkbox" class="w-4 h-4 accent-brand-primary" />
        <span class="font-sans text-sm text-brand-olive">Solo destacados</span>
      </label>

      <span class="font-sans text-xs text-brand-olive/50">
        Destacados: {{ featuredCount }}/10
      </span>

      <label class="flex items-center gap-2 cursor-pointer">
        <input v-model="filterInactive" type="checkbox" class="w-4 h-4 accent-brand-primary" />
        <span class="font-sans text-sm text-brand-olive">Solo inactivos</span>
      </label>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <p class="font-sans text-brand-olive/60 text-sm">Cargando productos...</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="filteredProducts.length === 0 && products.length === 0" class="text-center py-12">
      <p class="font-sans text-brand-olive/60 text-sm mb-4">No hay productos cargados.</p>
      <NuxtLink
        to="/productos/nuevo"
        class="inline-block px-5 py-2 bg-brand-primary text-brand-cream font-sans text-sm font-medium hover:bg-brand-primary/90 transition-colors"
      >
        Crear primer producto
      </NuxtLink>
    </div>

    <!-- No results for filters -->
    <div v-else-if="filteredProducts.length === 0" class="text-center py-12">
      <p class="font-sans text-brand-olive/60 text-sm">No hay productos que coincidan con los filtros.</p>
    </div>

    <!-- Drag-and-drop reorder view (when filtering featured) -->
    <div v-else-if="filterFeatured">
      <div
        ref="dragListRef"
        class="space-y-1"
      >
        <div
          v-for="(product, index) in dragList"
          :key="product.id"
          class="flex items-center gap-4 px-4 py-3 bg-white border-2 border-brand-olive/10 hover:border-brand-olive/20 transition-colors"
        >
          <!-- Drag handle -->
          <button type="button" class="cursor-grab active:cursor-grabbing text-brand-olive/30 hover:text-brand-olive/60 flex-shrink-0" data-drag-handle>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="5" cy="2" r="1.5" /><circle cx="11" cy="2" r="1.5" />
              <circle cx="5" cy="8" r="1.5" /><circle cx="11" cy="8" r="1.5" />
              <circle cx="5" cy="14" r="1.5" /><circle cx="11" cy="14" r="1.5" />
            </svg>
          </button>

          <!-- Order number -->
          <span class="font-sans text-sm text-brand-olive/40 w-6 text-center flex-shrink-0">{{ index + 1 }}</span>

          <!-- Thumbnail -->
          <img
            v-if="product.images && product.images.length > 0"
            :src="product.images[0].url"
            :alt="product.name"
            class="w-10 h-10 object-cover border border-brand-olive/10 flex-shrink-0"
            @error="e => { e.target.src = '/images/icon.png'; e.target.classList.remove('object-cover'); e.target.classList.add('object-contain', 'p-1', 'opacity-30') }"
          />
          <div v-else class="w-10 h-10 bg-brand-olive/5 border border-brand-olive/10 flex items-center justify-center flex-shrink-0">
            <img src="/images/icon.png" alt="" class="w-6 h-6 opacity-20" />
          </div>

          <!-- Product name -->
          <span class="font-sans text-sm text-brand-olive font-medium flex-1 min-w-0 truncate">{{ product.name }}</span>

          <!-- Edit link -->
          <NuxtLink
            :to="`/productos/${product.id}`"
            class="px-3 py-1 font-sans text-xs text-brand-primary border border-brand-primary/30 hover:bg-brand-primary hover:text-brand-cream transition-colors flex-shrink-0"
          >
            Editar
          </NuxtLink>
        </div>
      </div>

      <!-- Save order button -->
      <div v-if="hasOrderChanged" class="mt-4 flex items-center gap-3">
        <button
          type="button"
          @click="saveOrder"
          :disabled="savingOrder"
          class="px-5 py-2 bg-brand-primary text-brand-cream font-sans text-sm font-medium hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
        >
          {{ savingOrder ? 'Guardando...' : 'Guardar orden' }}
        </button>
        <button
          type="button"
          @click="resetOrder"
          class="px-5 py-2 font-sans text-sm text-brand-olive border-2 border-brand-olive/20 hover:border-brand-olive/40 transition-colors"
        >
          Descartar
        </button>
      </div>
    </div>

    <!-- Table (default view) -->
    <div v-else class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b-2 border-brand-olive/10">
            <th class="text-left font-sans text-xs uppercase tracking-wide text-brand-olive/60 py-3 pr-4">Imagen</th>
            <th class="text-left font-sans text-xs uppercase tracking-wide text-brand-olive/60 py-3 pr-4">Nombre</th>
            <th class="text-left font-sans text-xs uppercase tracking-wide text-brand-olive/60 py-3 pr-4">Categoria</th>
            <th class="text-right font-sans text-xs uppercase tracking-wide text-brand-olive/60 py-3 pr-4">Precio</th>
            <th class="text-center font-sans text-xs uppercase tracking-wide text-brand-olive/60 py-3 pr-4">Stock</th>
            <th class="text-center font-sans text-xs uppercase tracking-wide text-brand-olive/60 py-3 pr-4">Destacado</th>
            <th class="text-center font-sans text-xs uppercase tracking-wide text-brand-olive/60 py-3 pr-4">Estado</th>
            <th class="text-right font-sans text-xs uppercase tracking-wide text-brand-olive/60 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="product in filteredProducts"
            :key="product.id"
            class="border-b border-brand-olive/5"
          >
            <!-- Imagen -->
            <td class="py-3 pr-4">
              <img
                v-if="product.images && product.images.length > 0"
                :src="product.images[0].url"
                :alt="product.name"
                class="w-12 h-12 object-cover border border-brand-olive/10"
                @error="e => { e.target.src = '/images/icon.png'; e.target.classList.remove('object-cover'); e.target.classList.add('object-contain', 'p-1', 'opacity-30') }"
              />
              <div v-else class="w-12 h-12 bg-brand-olive/5 border border-brand-olive/10 flex items-center justify-center">
                <img src="/images/icon.png" alt="" class="w-8 h-8 opacity-20" />
              </div>
            </td>

            <!-- Nombre -->
            <td class="py-3 pr-4">
              <span class="font-sans text-sm text-brand-olive font-medium">{{ product.name }}</span>
            </td>

            <!-- Categoria -->
            <td class="py-3 pr-4">
              <span v-if="product.parentCategoryName && product.categoryName" class="font-sans text-sm text-brand-olive/60">
                {{ product.parentCategoryName }} → {{ product.categoryName }}
              </span>
              <span v-else class="font-sans text-sm text-brand-olive/60">{{ product.categoryName || product.parentCategoryName || '-' }}</span>
            </td>

            <!-- Precio -->
            <td class="py-3 pr-4 text-right">
              <span class="font-sans text-sm text-brand-olive font-medium">{{ formatPrice(product.price) }}</span>
              <span
                v-if="product.compareAtPrice"
                class="block font-sans text-xs text-brand-olive/40 line-through"
              >
                {{ formatPrice(product.compareAtPrice) }}
              </span>
            </td>

            <!-- Stock -->
            <td class="py-3 pr-4 text-center">
              <span class="font-sans text-sm text-brand-olive/60">
                {{ product.stock === -1 ? 'Ilimitado' : product.stock }}
              </span>
            </td>

            <!-- Destacado -->
            <td class="py-3 pr-4 text-center">
              <button
                type="button"
                @click="toggleFeatured(product)"
                class="text-lg hover:scale-110 transition-transform"
                :class="[
                  togglingFeatured[product.id] ? 'pointer-events-none opacity-50' : '',
                  !product.isFeatured && featuredCount >= 10 ? 'opacity-30 cursor-not-allowed' : '',
                ]"
                :title="!product.isFeatured && featuredCount >= 10 ? 'Máximo 10 destacados' : product.isFeatured ? 'Quitar de destacados' : 'Marcar como destacado'"
                :disabled="togglingFeatured[product.id] || (!product.isFeatured && featuredCount >= 10)"
              >
                <span v-if="togglingFeatured[product.id]" class="inline-block w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <span v-else-if="product.isFeatured" class="text-amber-500">&#9733;</span>
                <span v-else class="text-brand-olive/20 hover:text-amber-300">&#9734;</span>
              </button>
            </td>

            <!-- Estado -->
            <td class="py-3 pr-4 text-center">
              <AdminStatusBadge :status="product.isActive" type="active" />
            </td>

            <!-- Acciones -->
            <td class="py-3 text-right">
              <div class="flex items-center justify-end gap-2">
                <NuxtLink
                  :to="`/productos/${product.id}`"
                  class="px-3 py-1 font-sans text-xs text-brand-primary border border-brand-primary/30 hover:bg-brand-primary hover:text-brand-cream transition-colors"
                >
                  Editar
                </NuxtLink>
                <button
                  type="button"
                  @click="confirmDelete(product)"
                  class="px-3 py-1 font-sans text-xs text-red-700 border border-red-300 hover:bg-red-700 hover:text-white transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AdminConfirmModal
      :visible="showDeleteModal"
      title="Eliminar producto"
      :message="`Se eliminara el producto '${productToDelete?.name}' y todas sus imagenes. Esta accion no se puede deshacer.`"
      @confirm="deleteProduct"
      @cancel="showDeleteModal = false"
    />
  </NuxtLayout>
</template>

<script setup>
import { formatPrice } from '~/utils/format'
import { useDragAndDrop } from '@formkit/drag-and-drop/vue'

const { get, put, patch, delete: apiDelete } = useApi()

const products = ref([])
const categories = ref([])
const loading = ref(true)
const showDeleteModal = ref(false)
const productToDelete = ref(null)
const togglingFeatured = ref({})
const savingOrder = ref(false)

// Filters
const filterCategory = ref('')
const filterFeatured = ref(false)
const filterInactive = ref(false)

// Flatten nested categories into a single list with labels
const flatCategories = computed(() => {
  const flat = []
  for (const parent of categories.value) {
    flat.push({ id: parent.id, label: parent.name })
    if (parent.children && parent.children.length > 0) {
      for (const child of parent.children) {
        flat.push({ id: child.id, label: `  ${parent.name} → ${child.name}` })
      }
    }
  }
  return flat
})

const featuredCount = computed(() => products.value.filter(p => p.isFeatured).length)

const filteredProducts = computed(() => {
  let result = products.value

  if (filterCategory.value) {
    result = result.filter(p =>
      p.categoryId === filterCategory.value || p.parentCategoryId === filterCategory.value
    )
  }

  if (filterFeatured.value) {
    result = result.filter(p => p.isFeatured === true)
  }

  if (filterInactive.value) {
    result = result.filter(p => p.isActive === false)
  }

  if (filterFeatured.value) {
    result = [...result].sort((a, b) => {
      const oa = a.featuredOrder || 0
      const ob = b.featuredOrder || 0
      if (oa === 0 && ob === 0) return 0
      if (oa === 0) return 1
      if (ob === 0) return -1
      return oa - ob
    })
  }

  return result
})

// Drag-and-drop for featured reorder
const [dragListRef, dragList] = useDragAndDrop([], {
  dragHandle: '[data-drag-handle]',
})

// Snapshot of original order IDs to detect changes
const originalOrderIds = ref([])

// Sync filteredProducts into dragList when entering featured mode
watch(filterFeatured, (val) => {
  if (val) {
    const sorted = filteredProducts.value
    dragList.value = [...sorted]
    originalOrderIds.value = sorted.map(p => p.id)
  }
}, { immediate: true })

// Also resync when products change while in featured mode
watch(filteredProducts, (newList) => {
  if (filterFeatured.value && !hasOrderChanged.value) {
    dragList.value = [...newList]
    originalOrderIds.value = newList.map(p => p.id)
  }
})

const hasOrderChanged = computed(() => {
  if (!filterFeatured.value) return false
  if (dragList.value.length !== originalOrderIds.value.length) return false
  return dragList.value.some((p, i) => p.id !== originalOrderIds.value[i])
})

async function saveOrder() {
  savingOrder.value = true
  try {
    const order = dragList.value.map((p, i) => ({
      id: p.id,
      featuredOrder: i + 1,
    }))
    await patch('/api/products/reorder-featured', { order })

    // Update local products data to reflect new order
    for (const item of order) {
      const prod = products.value.find(p => p.id === item.id)
      if (prod) prod.featuredOrder = item.featuredOrder
    }
    originalOrderIds.value = dragList.value.map(p => p.id)
  } catch (error) {
    console.error('Error saving order:', error)
    alert(error.message || 'Error al guardar el orden')
  } finally {
    savingOrder.value = false
  }
}

function resetOrder() {
  const sorted = filteredProducts.value
  dragList.value = [...sorted]
  originalOrderIds.value = sorted.map(p => p.id)
}

async function loadData() {
  loading.value = true
  try {
    const [productsData, categoriesData] = await Promise.all([
      get('/api/products/all'),
      get('/api/categories/all'),
    ])
    products.value = productsData
    categories.value = categoriesData
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    loading.value = false
  }
}

async function toggleFeatured(product) {
  togglingFeatured.value[product.id] = true
  try {
    const newFeatured = !product.isFeatured
    const updated = await put(`/api/products/${product.id}`, {
      isFeatured: newFeatured,
    })
    product.isFeatured = updated.isFeatured
    product.featuredOrder = updated.featuredOrder
  } catch (error) {
    console.error('Error toggling featured:', error)
    alert(error.message || 'Error al cambiar destacado')
  } finally {
    delete togglingFeatured.value[product.id]
  }
}

function confirmDelete(product) {
  productToDelete.value = product
  showDeleteModal.value = true
}

async function deleteProduct() {
  if (!productToDelete.value) return

  try {
    await apiDelete(`/api/products/${productToDelete.value.id}`)
    products.value = products.value.filter(p => p.id !== productToDelete.value.id)
  } catch (error) {
    console.error('Error deleting product:', error)
    alert(error.message || 'Error al eliminar el producto')
  } finally {
    showDeleteModal.value = false
    productToDelete.value = null
  }
}

onMounted(loadData)
</script>
