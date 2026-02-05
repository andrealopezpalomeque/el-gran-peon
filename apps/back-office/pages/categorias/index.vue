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

      <!-- Nested category list -->
      <div v-else class="space-y-6">
        <div
          v-for="parent in categories"
          :key="parent.id"
          class="border-2 border-brand-olive/10"
        >
          <!-- Parent category header -->
          <div class="flex items-center justify-between px-4 py-3 bg-brand-olive/5">
            <div class="flex items-center gap-3">
              <img
                v-if="parent.image"
                :src="parent.image"
                :alt="parent.name"
                class="w-10 h-10 object-cover border border-brand-olive/10"
              />
              <div v-else class="w-10 h-10 bg-brand-olive/10 border border-brand-olive/10" />
              <div>
                <span class="font-sans text-sm text-brand-olive font-semibold">{{ parent.name }}</span>
                <span v-if="parent.description" class="block font-sans text-xs text-brand-olive/50">{{ parent.description }}</span>
              </div>
              <AdminStatusBadge :status="parent.isActive" type="active" />
            </div>
            <div class="flex items-center gap-2">
              <span class="font-sans text-xs text-brand-olive/40 mr-2">Orden: {{ parent.order ?? 0 }}</span>
              <NuxtLink
                :to="`/categorias/${parent.id}`"
                class="px-3 py-1 font-sans text-xs text-brand-primary border border-brand-primary/30 hover:bg-brand-primary hover:text-brand-cream transition-colors"
              >
                Editar
              </NuxtLink>
              <button
                @click="confirmDelete(parent)"
                class="px-3 py-1 font-sans text-xs text-red-700 border border-red-300 hover:bg-red-700 hover:text-white transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>

          <!-- Child categories -->
          <div v-if="parent.children && parent.children.length > 0">
            <table class="w-full">
              <tbody>
                <tr
                  v-for="child in parent.children"
                  :key="child.id"
                  class="border-t border-brand-olive/5"
                >
                  <td class="py-2 pl-8 pr-4">
                    <div class="flex items-center gap-3">
                      <span class="font-sans text-xs text-brand-olive/30">&mdash;</span>
                      <span class="font-sans text-sm text-brand-olive">{{ child.name }}</span>
                    </div>
                  </td>
                  <td class="py-2 pr-4">
                    <span class="font-sans text-xs text-brand-olive/40">Orden: {{ child.order ?? 0 }}</span>
                  </td>
                  <td class="py-2 pr-4">
                    <AdminStatusBadge :status="child.isActive" type="active" />
                  </td>
                  <td class="py-2 pr-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <NuxtLink
                        :to="`/categorias/${child.id}`"
                        class="px-3 py-1 font-sans text-xs text-brand-primary border border-brand-primary/30 hover:bg-brand-primary hover:text-brand-cream transition-colors"
                      >
                        Editar
                      </NuxtLink>
                      <button
                        @click="confirmDelete(child)"
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

          <!-- No children -->
          <div v-else class="px-8 py-2 border-t border-brand-olive/5">
            <span class="font-sans text-xs text-brand-olive/30 italic">Sin subcategorias</span>
          </div>
        </div>
      </div>

      <AdminConfirmModal
        :visible="showDeleteModal"
        title="Eliminar categoria"
        :message="deleteMessage"
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

const deleteMessage = computed(() => {
  if (!categoryToDelete.value) return ''
  return `Se eliminara la categoria '${categoryToDelete.value.name}'. Esta accion no se puede deshacer.`
})

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
    await loadCategories()
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
