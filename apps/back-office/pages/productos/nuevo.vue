<template>
  <NuxtLayout name="admin">
    <div class="flex items-center justify-between mb-6">
      <h2 class="font-sans text-brand-olive text-2xl font-semibold">Nuevo Producto</h2>
    </div>

    <div v-if="loadingCategories" class="text-center py-12">
      <p class="font-sans text-brand-olive/60 text-sm">Cargando...</p>
    </div>

    <AdminProductForm
      v-else
      :categories="categories"
      :is-loading="saving"
      :error="error"
      @save="handleSave"
      @cancel="router.push('/productos')"
    />
  </NuxtLayout>
</template>

<script setup>
const { get, post, put } = useApi()
const router = useRouter()

const categories = ref([])
const loadingCategories = ref(true)
const saving = ref(false)
const error = ref('')

onMounted(async () => {
  try {
    const categoriesData = await get('/api/categories/all')
    categories.value = categoriesData
  } catch (err) {
    console.error('Error loading data:', err)
  } finally {
    loadingCategories.value = false
  }
})

async function handleSave(productData) {
  saving.value = true
  error.value = ''

  try {
    // 1. Create product (with cloudinaryFolder for consistent naming) without images
    const { images, ...dataWithoutImages } = productData
    const created = await post('/api/products', {
      ...dataWithoutImages,
      images: [],
    })


    // 2. If there are already uploaded images, update the product with them
    if (images && images.length > 0) {
      await put(`/api/products/${created.id}`, { images })
    }

    router.push('/productos')
  } catch (err) {
    error.value = err.message || 'Error al crear el producto'
  } finally {
    saving.value = false
  }
}
</script>
