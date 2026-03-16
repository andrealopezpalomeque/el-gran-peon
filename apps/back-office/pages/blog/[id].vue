<template>
  <NuxtLayout name="admin">
    <div class="flex items-center justify-between mb-6">
      <h2 class="font-sans text-brand-olive text-2xl font-semibold">Editar Post</h2>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <p class="font-sans text-brand-olive/60 text-sm">Cargando...</p>
    </div>

    <!-- Error -->
    <div v-else-if="loadError" class="text-center py-12">
      <p class="font-sans text-red-600 text-sm">{{ loadError }}</p>
      <NuxtLink to="/blog" class="inline-block mt-4 font-sans text-sm text-brand-primary underline underline-offset-4">
        Volver al listado
      </NuxtLink>
    </div>

    <!-- Form -->
    <form v-else @submit.prevent="handleSubmit" class="max-w-3xl space-y-10">
      <!-- INFORMACION BASICA -->
      <section>
        <h3 class="font-display uppercase text-brand-olive text-lg mb-4">INFORMACION BASICA</h3>

        <div class="mb-4">
          <label class="block font-sans text-sm text-brand-olive mb-1">
            Titulo <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.title"
            type="text"
            required
            class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
          />
          <p v-if="form.title" class="mt-1 font-sans text-xs text-brand-olive/40">
            Slug: {{ generatedSlug }}
          </p>
        </div>

        <div class="mb-4">
          <label class="block font-sans text-sm text-brand-olive mb-1">Subtitulo</label>
          <input
            v-model="form.subtitle"
            type="text"
            class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
          />
        </div>

        <div class="mb-4">
          <label class="block font-sans text-sm text-brand-olive mb-1">
            Categoria <span class="text-red-500">*</span>
          </label>
          <select
            v-model="form.category"
            required
            class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
          >
            <option value="" disabled>Seleccionar categoria</option>
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>

        <div class="mb-4">
          <label class="block font-sans text-sm text-brand-olive mb-1">
            Extracto <span class="text-red-500">*</span>
          </label>
          <textarea
            v-model="form.excerpt"
            required
            maxlength="200"
            rows="2"
            class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors resize-none"
          />
          <p class="mt-1 font-sans text-xs text-brand-olive/40">
            {{ form.excerpt.length }}/200
          </p>
        </div>
      </section>

      <!-- IMAGEN PRINCIPAL -->
      <section>
        <h3 class="font-display uppercase text-brand-olive text-lg mb-4">IMAGEN PRINCIPAL</h3>
        <AdminMultiImageUpload
          ref="imageUploader"
          v-model="heroImages"
          :max-images="1"
          upload-endpoint="/api/upload/product-image"
          folder="blog"
        />
      </section>

      <!-- CONTENIDO -->
      <section>
        <h3 class="font-display uppercase text-brand-olive text-lg mb-4">CONTENIDO</h3>
        <AdminRichTextEditor
          v-model="form.body"
          min-height="300px"
        />
      </section>

      <!-- SEO -->
      <section>
        <h3 class="font-display uppercase text-brand-olive text-lg mb-4">SEO (OPCIONAL)</h3>

        <div class="mb-4">
          <label class="block font-sans text-sm text-brand-olive mb-1">Titulo SEO</label>
          <input
            v-model="form.seoTitle"
            type="text"
            class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
          />
        </div>

        <div class="mb-4">
          <label class="block font-sans text-sm text-brand-olive mb-1">Descripcion SEO</label>
          <textarea
            v-model="form.seoDescription"
            rows="2"
            class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors resize-none"
          />
        </div>
      </section>

      <!-- OPCIONES -->
      <section>
        <h3 class="font-display uppercase text-brand-olive text-lg mb-4">OPCIONES</h3>
        <label class="flex items-center gap-2 font-sans text-sm text-brand-olive cursor-pointer">
          <input v-model="form.isPublished" type="checkbox" class="accent-brand-primary" />
          Publicado
        </label>
        <p class="mt-1 font-sans text-xs text-brand-olive/40">
          Si no esta publicado, solo sera visible en el panel de administracion.
        </p>
      </section>

      <!-- Actions -->
      <div class="flex items-center gap-4 pt-4 border-t border-brand-olive/10">
        <button
          type="submit"
          :disabled="saving"
          class="px-6 py-2 bg-brand-primary text-brand-cream font-sans text-sm hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
        >
          {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
        </button>
        <NuxtLink
          to="/blog"
          class="px-6 py-2 border-2 border-brand-olive/20 font-sans text-sm text-brand-olive hover:border-brand-olive/40 transition-colors"
        >
          Cancelar
        </NuxtLink>
      </div>

      <p v-if="error" class="font-sans text-sm text-red-600 mt-2">{{ error }}</p>

      <!-- DANGER ZONE -->
      <section class="mt-12 pt-8 border-t border-red-200">
        <h3 class="font-display uppercase text-red-600 text-lg mb-4">ZONA PELIGROSA</h3>
        <p class="font-sans text-sm text-brand-olive/60 mb-4">
          Eliminar este post de forma permanente. Esta accion no se puede deshacer.
        </p>
        <button
          type="button"
          class="px-6 py-2 border-2 border-red-300 text-red-600 font-sans text-sm hover:bg-red-50 transition-colors"
          @click="showDeleteModal = true"
        >
          Eliminar Post
        </button>
      </section>
    </form>

    <!-- Delete Modal -->
    <AdminConfirmModal
      :visible="showDeleteModal"
      :loading="deletingPost"
      title="Eliminar post"
      :message="`Se eliminara el post '${form.title}'. Esta accion no se puede deshacer.`"
      @confirm="handleDelete"
      @cancel="showDeleteModal = false"
    />
  </NuxtLayout>
</template>

<script setup>
import slugify from 'slugify'

const { get, put, delete: apiDelete } = useApi()
const route = useRoute()
const router = useRouter()

const categories = ['Lanzamiento', 'Proceso', 'Historia', 'Noticia']

const form = ref({
  title: '',
  subtitle: '',
  category: '',
  excerpt: '',
  body: '',
  seoTitle: '',
  seoDescription: '',
  isPublished: false,
})

const heroImages = ref([])
const loading = ref(true)
const loadError = ref('')
const saving = ref(false)
const error = ref('')
const showDeleteModal = ref(false)
const deletingPost = ref(false)

const generatedSlug = computed(() =>
  form.value.title ? slugify(form.value.title, { lower: true, strict: true }) : ''
)

onMounted(async () => {
  try {
    const post = await get(`/api/blog/admin/${route.params.id}`)

    form.value = {
      title: post.title || '',
      subtitle: post.subtitle || '',
      category: post.category || '',
      excerpt: post.excerpt || '',
      body: post.body || '',
      seoTitle: post.seoTitle || '',
      seoDescription: post.seoDescription || '',
      isPublished: post.isPublished ?? false,
    }

    if (post.heroImage?.url) {
      heroImages.value = [{
        url: post.heroImage.url,
        publicId: post.heroImage.publicId || '',
        order: 0,
      }]
    }
  } catch (err) {
    loadError.value = err.message || 'Error al cargar el post'
  } finally {
    loading.value = false
  }
})

async function handleSubmit() {
  error.value = ''

  if (heroImages.value.length === 0) {
    error.value = 'Imagen principal requerida.'
    return
  }

  saving.value = true

  try {
    const data = {
      ...form.value,
      heroImage: {
        url: heroImages.value[0].url,
        publicId: heroImages.value[0].publicId,
      },
    }

    await put(`/api/blog/${route.params.id}`, data)
    router.push({ path: '/blog', query: { toast: `Post "${form.value.title}" actualizado` } })
  } catch (err) {
    error.value = err.message || 'Error al actualizar el post'
  } finally {
    saving.value = false
  }
}

async function handleDelete() {
  deletingPost.value = true
  try {
    const title = form.value.title
    await apiDelete(`/api/blog/${route.params.id}`)
    router.push({ path: '/blog', query: { toast: `Post "${title}" eliminado` } })
  } catch (err) {
    showDeleteModal.value = false
    error.value = err.message || 'Error al eliminar el post'
  } finally {
    deletingPost.value = false
  }
}
</script>
