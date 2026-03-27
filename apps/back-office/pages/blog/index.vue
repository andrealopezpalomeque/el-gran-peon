<template>
  <NuxtLayout name="admin">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="font-sans text-brand-olive text-2xl font-semibold">Blog</h2>
      <NuxtLink
        to="/blog/nuevo"
        class="px-6 py-2 bg-brand-primary text-brand-cream font-sans text-sm hover:bg-brand-primary/90 transition-colors"
      >
        Nuevo Post
      </NuxtLink>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <p class="font-sans text-brand-olive/60 text-sm">Cargando posts...</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="posts.length === 0" class="text-center py-12">
      <p class="font-sans text-brand-olive/60 text-sm">No hay posts todavia.</p>
      <NuxtLink
        to="/blog/nuevo"
        class="inline-block mt-4 font-sans text-sm text-brand-primary underline underline-offset-4"
      >
        Crear el primer post
      </NuxtLink>
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto">
      <table class="w-full font-sans text-sm">
        <thead>
          <tr class="border-b-2 border-brand-olive/10 text-left">
            <th class="pb-3 font-medium text-brand-olive/60">Titulo</th>
            <th class="pb-3 font-medium text-brand-olive/60">Categoria</th>
            <th class="pb-3 font-medium text-brand-olive/60 text-center">Estado</th>
            <th class="pb-3 font-medium text-brand-olive/60">Fecha</th>
            <th class="pb-3 font-medium text-brand-olive/60 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="post in posts"
            :key="post.id"
            class="border-b border-brand-olive/5 hover:bg-brand-olive/[0.02] transition-colors"
          >
            <td class="py-3 pr-4">
              <div class="flex items-center gap-3">
                <div v-if="post.heroImage?.url" class="w-12 h-9 flex-shrink-0 overflow-hidden bg-brand-cream">
                  <img :src="optimizedUrl(post.heroImage.url, { width: 80, height: 60 })" :alt="post.title" class="w-full h-full object-cover" />
                </div>
                <span class="text-brand-olive font-medium">{{ post.title }}</span>
              </div>
            </td>
            <td class="py-3 pr-4">
              <span class="text-brand-olive/60">{{ post.category }}</span>
            </td>
            <td class="py-3 text-center">
              <span
                class="inline-block px-2 py-0.5 text-xs font-medium"
                :class="post.isPublished
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'"
              >
                {{ post.isPublished ? 'Publicado' : 'Borrador' }}
              </span>
            </td>
            <td class="py-3 pr-4 text-brand-olive/60">
              {{ formatDate(post.publishedAt || post.createdAt) }}
            </td>
            <td class="py-3 text-right">
              <NuxtLink
                :to="`/blog/${post.id}`"
                class="font-sans text-sm text-brand-primary hover:text-brand-primary/70 transition-colors"
              >
                Editar
              </NuxtLink>
              <button
                class="ml-4 font-sans text-sm text-red-600 hover:text-red-800 transition-colors"
                @click="confirmDelete(post)"
              >
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Delete Modal -->
    <AdminConfirmModal
      :visible="showDeleteModal"
      :loading="deleting"
      title="Eliminar post"
      :message="`Se eliminara el post '${postToDelete?.title}'. Esta accion no se puede deshacer.`"
      @confirm="deletePost"
      @cancel="showDeleteModal = false"
    />

    <!-- Toast -->
    <Transition name="toast">
      <div
        v-if="toastMessage"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 font-sans text-sm px-6 py-3"
        :class="toastType === 'success' ? 'bg-green-800 text-white' : 'bg-red-800 text-white'"
      >
        {{ toastMessage }}
      </div>
    </Transition>
  </NuxtLayout>
</template>

<script setup>
const { optimizedUrl } = useCloudinaryUrl()
const { get, delete: apiDelete } = useApi()
const route = useRoute()
const router = useRouter()

const posts = ref([])
const loading = ref(true)
const showDeleteModal = ref(false)
const postToDelete = ref(null)
const deleting = ref(false)
const toastMessage = ref('')
const toastType = ref('success')
let toastTimeout = null

function formatDate(dateValue) {
  if (!dateValue) return '—'
  const d = dateValue._seconds ? new Date(dateValue._seconds * 1000) : new Date(dateValue)
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function showToast(message, type = 'success') {
  toastMessage.value = message
  toastType.value = type
  if (toastTimeout) clearTimeout(toastTimeout)
  toastTimeout = setTimeout(() => { toastMessage.value = '' }, 3000)
}

function confirmDelete(post) {
  postToDelete.value = post
  showDeleteModal.value = true
}

async function deletePost() {
  deleting.value = true
  try {
    await apiDelete(`/api/blog/${postToDelete.value.id}`)
    posts.value = posts.value.filter(p => p.id !== postToDelete.value.id)
    showDeleteModal.value = false
    showToast(`Post "${postToDelete.value.title}" eliminado`)
  } catch (err) {
    showToast(err.message || 'Error al eliminar', 'error')
  } finally {
    deleting.value = false
  }
}

onMounted(async () => {
  try {
    const data = await get('/api/blog/all')
    posts.value = data.posts || []
  } catch (err) {
    showToast('Error al cargar posts', 'error')
  } finally {
    loading.value = false
  }

  if (route.query.toast) {
    showToast(route.query.toast)
    router.replace({ query: {} })
  }
})
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(1rem);
}
</style>
