<template>
  <NuxtLayout name="admin">
    <div class="flex items-center justify-between mb-6">
      <h2 class="font-sans text-brand-olive text-2xl font-semibold">Editar Producto</h2>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <p class="font-sans text-brand-olive/60 text-sm">Cargando...</p>
    </div>

    <!-- Load error -->
    <div v-else-if="loadError" class="text-center py-12">
      <p class="font-sans text-red-600 text-sm">{{ loadError }}</p>
      <NuxtLink
        to="/productos"
        class="inline-block mt-4 px-5 py-2 font-sans text-sm text-brand-olive border-2 border-brand-olive/20 hover:border-brand-olive/40 transition-colors"
      >
        Volver a productos
      </NuxtLink>
    </div>

    <template v-else>
      <AdminProductForm
        :product="product"
        :categories="categories"
        :is-loading="saving"
        :error="error"
        @save="handleSave"
        @cancel="handleCancel"
      />

      <!-- Delete section -->
      <div class="max-w-3xl mt-12 pt-8 border-t-2 border-red-200">
        <h3 class="font-display text-red-700 text-lg mb-2 uppercase">ZONA PELIGROSA</h3>
        <p class="font-sans text-sm text-brand-olive/60 mb-4">
          Eliminar este producto borrara toda su informacion e imagenes permanentemente.
        </p>
        <button
          type="button"
          @click="showDeleteModal = true"
          class="px-5 py-2 font-sans text-sm text-red-700 border-2 border-red-300 hover:bg-red-700 hover:text-white transition-colors"
        >
          Eliminar Producto
        </button>
      </div>
    </template>

    <AdminConfirmModal
      :visible="showDeleteModal"
      title="Eliminar producto"
      :message="`Se eliminara el producto '${product?.name}' y todas sus imagenes. Esta accion no se puede deshacer.`"
      @confirm="deleteProduct"
      @cancel="showDeleteModal = false"
    />
  </NuxtLayout>
</template>

<script setup>
const route = useRoute()
const router = useRouter()
const { get, put, delete: apiDelete } = useApi()

const product = ref(null)
const categories = ref([])
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const loadError = ref('')
const showDeleteModal = ref(false)
const isDirty = ref(false)

onMounted(async () => {
  try {
    const [productData, categoriesData] = await Promise.all([
      get(`/api/products/${route.params.id}`),
      get('/api/categories/all'),
    ])
    product.value = productData
    categories.value = categoriesData

    // Track dirty state after initial load
    nextTick(() => {
      isDirty.value = false
    })
  } catch (err) {
    loadError.value = err.message || 'Error al cargar el producto'
    console.error(err)
  } finally {
    loading.value = false
  }
})

// Unsaved changes warning
onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', beforeUnloadHandler)
})

function beforeUnloadHandler(e) {
  if (isDirty.value) {
    e.preventDefault()
    e.returnValue = ''
  }
}

watch(isDirty, (val) => {
  if (val) {
    window.addEventListener('beforeunload', beforeUnloadHandler)
  } else {
    window.removeEventListener('beforeunload', beforeUnloadHandler)
  }
})

// Mark as dirty when product form data changes
onMounted(() => {
  // Use a small delay to avoid triggering on initial hydration
  setTimeout(() => {
    watch(
      () => product.value,
      () => { isDirty.value = true },
      { deep: true }
    )
  }, 500)
})

async function handleSave(productData) {
  saving.value = true
  error.value = ''

  try {
    await put(`/api/products/${route.params.id}`, productData)
    isDirty.value = false
    router.push('/productos')
  } catch (err) {
    error.value = err.message || 'Error al actualizar el producto'
  } finally {
    saving.value = false
  }
}

function handleCancel() {
  if (isDirty.value && !confirm('Hay cambios sin guardar. ¿Deseas salir?')) {
    return
  }
  router.push('/productos')
}

async function deleteProduct() {
  try {
    await apiDelete(`/api/products/${route.params.id}`)
    isDirty.value = false
    router.push('/productos')
  } catch (err) {
    console.error('Error deleting product:', err)
    alert(err.message || 'Error al eliminar el producto')
  } finally {
    showDeleteModal.value = false
  }
}
</script>
