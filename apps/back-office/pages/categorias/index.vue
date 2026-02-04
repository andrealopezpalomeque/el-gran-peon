<template>
  <div>
    <NuxtLayout name="admin">
      <div class="flex items-center justify-between mb-6">
        <h2 class="font-sans text-brand-olive text-2xl font-semibold">Categorias</h2>
        <NuxtLink
          to="/categorias/nueva"
          class="px-5 py-2 bg-brand-primary text-brand-cream font-sans text-sm font-medium hover:bg-brand-primary/90 transition-colors"
        >
          Nueva Categoria
        </NuxtLink>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <p class="font-sans text-brand-olive/60 text-sm">Cargando categorias...</p>
      </div>

      <!-- Empty state -->
      <div v-else-if="categories.length === 0" class="text-center py-12">
        <p class="font-sans text-brand-olive/60 text-sm">No hay categorias creadas.</p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b-2 border-brand-olive/10">
              <th class="text-left font-sans text-xs uppercase tracking-wide text-brand-olive/60 py-3 pr-4">Nombre</th>
              <th class="text-left font-sans text-xs uppercase tracking-wide text-brand-olive/60 py-3 pr-4">Descripcion</th>
              <th class="text-left font-sans text-xs uppercase tracking-wide text-brand-olive/60 py-3 pr-4">Orden</th>
              <th class="text-left font-sans text-xs uppercase tracking-wide text-brand-olive/60 py-3 pr-4">Estado</th>
              <th class="text-right font-sans text-xs uppercase tracking-wide text-brand-olive/60 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="cat in categories"
              :key="cat.id"
              class="border-b border-brand-olive/5"
            >
              <td class="py-3 pr-4">
                <div class="flex items-center gap-3">
                  <img
                    v-if="cat.image"
                    :src="cat.image"
                    :alt="cat.name"
                    class="w-10 h-10 object-cover border border-brand-olive/10"
                  />
                  <div v-else class="w-10 h-10 bg-brand-olive/5 border border-brand-olive/10" />
                  <span class="font-sans text-sm text-brand-olive font-medium">{{ cat.name }}</span>
                </div>
              </td>
              <td class="py-3 pr-4">
                <span class="font-sans text-sm text-brand-olive/60">{{ cat.description || '-' }}</span>
              </td>
              <td class="py-3 pr-4">
                <span class="font-sans text-sm text-brand-olive/60">{{ cat.order ?? 0 }}</span>
              </td>
              <td class="py-3 pr-4">
                <AdminStatusBadge :status="cat.isActive" type="active" />
              </td>
              <td class="py-3 text-right">
                <div class="flex items-center justify-end gap-2">
                  <NuxtLink
                    :to="`/categorias/${cat.id}`"
                    class="px-3 py-1 font-sans text-xs text-brand-primary border border-brand-primary/30 hover:bg-brand-primary hover:text-brand-cream transition-colors"
                  >
                    Editar
                  </NuxtLink>
                  <button
                    @click="confirmDelete(cat)"
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
        title="Eliminar categoria"
        :message="`Se eliminara la categoria '${categoryToDelete?.name}'. Esta accion no se puede deshacer.`"
        @confirm="deleteCategory"
        @cancel="showDeleteModal = false"
      />
    </NuxtLayout>
  </div>
</template>

<script setup>
const { get, delete: apiDelete } = useApi()

const categories = ref([])
const loading = ref(true)
const showDeleteModal = ref(false)
const categoryToDelete = ref(null)

async function loadCategories() {
  loading.value = true
  try {
    categories.value = await get('/api/categories/all')
  } catch (error) {
    console.error('Error loading categories:', error)
  } finally {
    loading.value = false
  }
}

function confirmDelete(cat) {
  categoryToDelete.value = cat
  showDeleteModal.value = true
}

async function deleteCategory() {
  if (!categoryToDelete.value) return

  try {
    await apiDelete(`/api/categories/${categoryToDelete.value.id}`)
    categories.value = categories.value.filter(c => c.id !== categoryToDelete.value.id)
  } catch (error) {
    console.error('Error deleting category:', error)
    alert(error.message || 'Error al eliminar la categoria')
  } finally {
    showDeleteModal.value = false
    categoryToDelete.value = null
  }
}

onMounted(loadCategories)
</script>
