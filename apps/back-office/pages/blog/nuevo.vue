<template>
  <NuxtLayout name="admin">
    <div class="flex items-center justify-between mb-6">
      <h2 class="font-sans text-brand-olive text-2xl font-semibold">Nuevo Post</h2>
    </div>

    <form @submit.prevent="handleSubmit" class="max-w-3xl space-y-10">
      <!-- INFORMACION BASICA -->
      <section>
        <h3 class="font-display uppercase text-brand-olive text-lg mb-4">INFORMACION BASICA</h3>

        <!-- Title -->
        <div class="mb-4">
          <label class="block font-sans text-sm text-brand-olive mb-1">
            Titulo <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.title"
            type="text"
            required
            class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
            placeholder="Titulo del post"
          />
          <p v-if="form.title" class="mt-1 font-sans text-xs text-brand-olive/40">
            Slug: {{ generatedSlug }}
          </p>
        </div>

        <!-- Subtitle -->
        <div class="mb-4">
          <label class="block font-sans text-sm text-brand-olive mb-1">Subtitulo</label>
          <input
            v-model="form.subtitle"
            type="text"
            class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
            placeholder="Linea corta debajo del titulo"
          />
        </div>

        <!-- Category -->
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

        <!-- Excerpt -->
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
            placeholder="Descripcion corta para tarjetas y SEO (max 200 caracteres)"
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
            placeholder="Override para el titulo en buscadores"
          />
        </div>

        <div class="mb-4">
          <label class="block font-sans text-sm text-brand-olive mb-1">Descripcion SEO</label>
          <textarea
            v-model="form.seoDescription"
            rows="2"
            class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors resize-none"
            placeholder="Override para la descripcion en buscadores"
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
          {{ saving ? 'Guardando...' : 'Guardar Post' }}
        </button>
        <NuxtLink
          to="/blog"
          class="px-6 py-2 border-2 border-brand-olive/20 font-sans text-sm text-brand-olive hover:border-brand-olive/40 transition-colors"
        >
          Cancelar
        </NuxtLink>
      </div>

      <p v-if="error" class="font-sans text-sm text-red-600 mt-2">{{ error }}</p>
    </form>
  </NuxtLayout>
</template>

<script setup>
import slugify from 'slugify'

const { post } = useApi()
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
const saving = ref(false)
const error = ref('')

const generatedSlug = computed(() =>
  form.value.title ? slugify(form.value.title, { lower: true, strict: true }) : ''
)

function validateHeadingOrder(html) {
  const headings = [...html.matchAll(/<(h[23])\b/gi)].map(m => m[1].toLowerCase())
  if (headings.length === 0) return null
  if (headings[0] === 'h3') {
    return 'Los subtitulos (H3) deben ir despues de un titulo (H2). Agrega un H2 antes del primer H3.'
  }
  return null
}

async function handleSubmit() {
  error.value = ''

  if (heroImages.value.length === 0) {
    error.value = 'Imagen principal requerida.'
    return
  }

  const headingError = validateHeadingOrder(form.value.body)
  if (headingError) {
    error.value = headingError
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

    await post('/api/blog', data)
    router.push({ path: '/blog', query: { toast: `Post "${form.value.title}" creado` } })
  } catch (err) {
    error.value = err.message || 'Error al crear el post'
  } finally {
    saving.value = false
  }
}
</script>
