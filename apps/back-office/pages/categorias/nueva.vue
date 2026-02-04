<template>
  <div>
    <NuxtLayout name="admin">
      <div class="flex items-center justify-between mb-6">
        <h2 class="font-sans text-brand-olive text-2xl font-semibold">Nueva Categoria</h2>
      </div>

      <form @submit.prevent="handleSubmit" class="max-w-2xl">
        <!-- Name -->
        <div class="mb-5">
          <label class="block font-sans text-sm text-brand-olive/70 mb-1">Nombre *</label>
          <input
            v-model="form.name"
            type="text"
            required
            class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
          />
        </div>

        <!-- Description -->
        <div class="mb-5">
          <label class="block font-sans text-sm text-brand-olive/70 mb-1">Descripcion</label>
          <textarea
            v-model="form.description"
            rows="3"
            class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors resize-vertical"
          />
        </div>

        <!-- Order -->
        <div class="mb-5">
          <label class="block font-sans text-sm text-brand-olive/70 mb-1">Orden</label>
          <input
            v-model.number="form.order"
            type="number"
            min="0"
            class="w-32 px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
          />
        </div>

        <!-- Active -->
        <div class="mb-5">
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              v-model="form.isActive"
              type="checkbox"
              class="w-4 h-4 accent-brand-primary"
            />
            <span class="font-sans text-sm text-brand-olive">Activa</span>
          </label>
        </div>

        <!-- Image -->
        <div class="mb-8">
          <label class="block font-sans text-sm text-brand-olive/70 mb-2">Imagen</label>
          <AdminImageUpload
            v-model="form.image"
            endpoint="/api/upload/category-image"
            folder="categories"
          />
        </div>

        <!-- Actions -->
        <div class="flex gap-3">
          <button
            type="submit"
            :disabled="saving"
            class="px-6 py-2 bg-brand-primary text-brand-cream font-sans text-sm font-medium hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
          >
            {{ saving ? 'Guardando...' : 'Guardar' }}
          </button>
          <NuxtLink
            to="/categorias"
            class="px-6 py-2 font-sans text-sm text-brand-olive border-2 border-brand-olive/20 hover:border-brand-olive/40 transition-colors"
          >
            Cancelar
          </NuxtLink>
        </div>

        <p v-if="error" class="mt-4 font-sans text-red-600 text-sm">{{ error }}</p>
      </form>
    </NuxtLayout>
  </div>
</template>

<script setup>
const { post } = useApi()
const router = useRouter()

const saving = ref(false)
const error = ref('')

const form = ref({
  name: '',
  description: '',
  order: 0,
  isActive: true,
  image: '',
})

async function handleSubmit() {
  saving.value = true
  error.value = ''

  try {
    await post('/api/categories', form.value)
    router.push('/categorias')
  } catch (err) {
    error.value = err.message || 'Error al crear la categoria'
  } finally {
    saving.value = false
  }
}
</script>
