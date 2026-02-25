<template>
  <form @submit.prevent="handleSubmit" class="max-w-3xl">

    <!-- Section 1: Informacion Basica -->
    <div class="mb-8">
      <h3 class="font-display text-brand-olive text-lg mb-4 uppercase">INFORMACION BASICA</h3>

      <div class="mb-5">
        <label class="block font-sans text-sm text-brand-olive/70 mb-1">Nombre *</label>
        <input
          v-model="form.name"
          type="text"
          required
          class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
        />
      </div>

      <div class="mb-5">
        <label class="block font-sans text-sm text-brand-olive/70 mb-1">Descripcion *</label>
        <AdminRichTextEditor v-model="form.description" />
      </div>

      <div class="mb-5">
        <label class="block font-sans text-sm text-brand-olive/70 mb-1">
          Descripcion Corta * <span class="text-brand-olive/40">({{ form.shortDescription.length }}/120)</span>
        </label>
        <input
          v-model="form.shortDescription"
          type="text"
          required
          maxlength="120"
          class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
        />
      </div>

      <div class="mb-5">
        <label class="block font-sans text-sm text-brand-olive/70 mb-1">Slug</label>
        <div class="px-4 py-2 border-2 border-brand-olive/10 bg-brand-olive/5 font-sans text-sm text-brand-olive/60">
          {{ generatedSlug || 'se-genera-automaticamente' }}
        </div>
      </div>
    </div>

    <!-- Section 2: Precio y Stock -->
    <div class="mb-8">
      <h3 class="font-display text-brand-olive text-lg mb-4 uppercase">PRECIO Y STOCK</h3>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
        <div>
          <label class="block font-sans text-sm text-brand-olive/70 mb-1">Precio (ARS)</label>
          <input
            v-model.number="form.price"
            type="number"
            min="0"
            step="1"
            placeholder="Dejar vacío si el precio es a consultar"
            class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
          />
        </div>

        <div>
          <label class="block font-sans text-sm text-brand-olive/70 mb-1">Precio Anterior</label>
          <input
            v-model.number="form.compareAtPrice"
            type="number"
            min="0"
            step="1"
            class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
          />
        </div>
      </div>

      <div class="mb-5">
        <label class="flex items-center gap-3 cursor-pointer mb-2">
          <input
            v-model="unlimitedStock"
            type="checkbox"
            class="w-4 h-4 accent-brand-primary"
          />
          <span class="font-sans text-sm text-brand-olive">Stock ilimitado</span>
        </label>
        <div v-if="!unlimitedStock">
          <label class="block font-sans text-sm text-brand-olive/70 mb-1">Stock</label>
          <input
            v-model.number="form.stock"
            type="number"
            min="0"
            class="w-32 px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
          />
        </div>
      </div>
    </div>

    <!-- Section 3: Categoria (cascading dropdowns) -->
    <div class="mb-8">
      <h3 class="font-display text-brand-olive text-lg mb-4 uppercase">CATEGORIA</h3>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <!-- Parent category dropdown -->
        <div>
          <label class="block font-sans text-sm text-brand-olive/70 mb-1">Categoria principal *</label>
          <select
            v-model="selectedParentId"
            required
            class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
            @change="onParentChange"
          >
            <option value="" disabled>Seleccionar categoria</option>
            <option
              v-for="cat in categories"
              :key="cat.id"
              :value="cat.id"
            >
              {{ cat.name }}
            </option>
          </select>
        </div>

        <!-- Child category dropdown (only if parent has children) -->
        <div v-if="selectedParentChildren.length > 0">
          <label class="block font-sans text-sm text-brand-olive/70 mb-1">Subcategoria *</label>
          <select
            v-model="selectedChildId"
            required
            class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
            @change="onChildChange"
          >
            <option value="" disabled>Seleccionar subcategoria</option>
            <option
              v-for="child in selectedParentChildren"
              :key="child.id"
              :value="child.id"
            >
              {{ child.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Section 4: Imagenes -->
    <div class="mb-8">
      <h3 class="font-display text-brand-olive text-lg mb-4 uppercase">IMAGENES</h3>

      <AdminMultiImageUpload
        ref="imageUploader"
        v-model="form.images"
        :max-images="6"
        upload-endpoint="/api/upload/product-image"
        :folder="imageFolder"
      />
    </div>

    <!-- Section 5: Videos -->
    <div class="mb-8">
      <h3 class="font-display text-brand-olive text-lg mb-4 uppercase">VIDEOS</h3>
      <p class="font-sans text-xs text-brand-olive/50 mb-4">
        Agregá videos de YouTube para mostrar el producto en uso o el proceso artesanal.
      </p>

      <div class="space-y-4">
        <div
          v-for="(video, index) in localVideos"
          :key="index"
          class="flex items-start gap-4 p-4 border-2 border-brand-olive/10"
        >
          <div class="flex-1 space-y-2">
            <input
              v-model="video.url"
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
              @blur="onVideoUrlBlur(video, index)"
            />
            <input
              v-model="video.title"
              type="text"
              placeholder="Titulo del video (opcional)"
              class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
            />
            <p v-if="video._error" class="font-sans text-xs text-red-600">{{ video._error }}</p>
          </div>

          <!-- Video thumbnail preview -->
          <div v-if="video.embedId" class="shrink-0 w-28 h-20 bg-black overflow-hidden">
            <img
              :src="`https://img.youtube.com/vi/${video.embedId}/mqdefault.jpg`"
              alt="Preview"
              class="w-full h-full object-cover"
            />
          </div>

          <button
            type="button"
            @click="removeVideo(index)"
            class="shrink-0 px-3 py-2 text-red-600 hover:bg-red-50 font-sans text-sm transition-colors"
          >
            Quitar
          </button>
        </div>

        <button
          type="button"
          @click="addVideo"
          class="w-full py-3 border-2 border-dashed border-brand-olive/20 text-brand-olive hover:border-brand-olive/40 font-sans text-sm transition-colors"
        >
          + Agregar Video de YouTube
        </button>
      </div>
    </div>

    <!-- Section 6: Personalizacion (solo para categoria Mate) -->
    <div v-if="isMateCategory" class="mb-8">
      <h3 class="font-display text-brand-olive text-lg mb-4 uppercase">PERSONALIZACION</h3>
      <p class="font-sans text-xs text-brand-olive/50 mb-4">Habilitar opciones de personalizacion para este producto</p>

      <div class="space-y-4">
        <div
          v-for="(cat, catId) in CUSTOMIZATION_CATALOG"
          :key="catId"
          class="border-2 p-4 transition-colors"
          :class="custSettings[catId].enabled ? 'border-brand-primary/30 bg-brand-primary/[0.02]' : 'border-brand-olive/10'"
        >
          <div class="flex items-center justify-between">
            <label class="flex items-center gap-3 cursor-pointer">
              <input
                v-model="custSettings[catId].enabled"
                type="checkbox"
                class="w-4 h-4 accent-brand-primary"
              />
              <span class="font-sans text-sm font-medium text-brand-olive">{{ cat.label }}</span>
            </label>
            <label v-if="custSettings[catId].enabled" class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="custSettings[catId].required"
                type="checkbox"
                class="w-4 h-4 accent-brand-primary"
              />
              <span class="font-sans text-xs text-brand-olive/70">Obligatorio</span>
            </label>
          </div>

          <div v-if="custSettings[catId].enabled" class="mt-3 space-y-2">
            <div
              v-for="(opt, oIdx) in custSettings[catId].options"
              :key="oIdx"
              class="flex items-center gap-3"
            >
              <span class="font-sans text-sm text-brand-olive flex-1">{{ opt.value }}</span>
              <label class="flex items-center gap-1">
                <span class="font-sans text-xs text-brand-olive/50">Extra $</span>
                <input
                  v-model.number="opt.extraPrice"
                  type="number"
                  min="0"
                  step="1"
                  class="w-24 px-2 py-1 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive text-right focus:outline-none focus:border-brand-primary transition-colors"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 6: Opciones -->
    <div class="mb-8">
      <h3 class="font-display text-brand-olive text-lg mb-4 uppercase">OPCIONES</h3>

      <div class="space-y-3 mb-5">
        <label class="flex items-center gap-3" :class="canToggleFeatured ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'">
          <input
            v-model="form.isFeatured"
            type="checkbox"
            class="w-4 h-4 accent-brand-primary"
            :disabled="!canToggleFeatured"
          />
          <span class="font-sans text-sm text-brand-olive">Destacado</span>
          <span v-if="!canToggleFeatured" class="font-sans text-xs text-brand-olive/50">(máximo 10)</span>
          <span v-else class="font-sans text-xs text-brand-olive/40">{{ featuredCount }}/10</span>
        </label>

        <label class="flex items-center gap-3 cursor-pointer">
          <input
            v-model="form.isActive"
            type="checkbox"
            class="w-4 h-4 accent-brand-primary"
          />
          <span class="font-sans text-sm text-brand-olive">Activo</span>
        </label>

        <label class="flex items-center gap-3 cursor-pointer">
          <input
            v-model="form.freeShipping"
            type="checkbox"
            class="w-4 h-4 accent-brand-primary"
          />
          <span class="font-sans text-sm text-brand-olive">Envío gratis</span>
        </label>

      </div>

      <div class="mb-5">
        <label class="block font-sans text-sm text-brand-olive/70 mb-1">Tags (separados por coma)</label>
        <input
          v-model="tagsInput"
          type="text"
          placeholder="mate, cuero, artesanal"
          class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
        />
      </div>
    </div>

    <!-- Actions -->
    <div class="flex gap-3 pt-4 border-t-2 border-brand-olive/10">
      <button
        type="submit"
        :disabled="isLoading || isUploading"
        class="px-6 py-2 bg-brand-primary text-brand-cream font-sans text-sm font-medium hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
      >
        {{ isLoading ? 'Guardando...' : isUploading ? 'Subiendo imagenes...' : 'Guardar Producto' }}
      </button>
      <button
        type="button"
        @click="$emit('cancel')"
        class="px-6 py-2 font-sans text-sm text-brand-olive border-2 border-brand-olive/20 hover:border-brand-olive/40 transition-colors"
      >
        Cancelar
      </button>
    </div>

    <p v-if="error" class="mt-4 font-sans text-red-600 text-sm">{{ error }}</p>
  </form>
</template>

<script setup>
const props = defineProps({
  product: { type: Object, default: null },
  categories: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false },
  error: { type: String, default: '' },
})

const emit = defineEmits(['save', 'cancel'])

const imageUploader = ref(null)
const isUploading = computed(() => imageUploader.value?.uploading ?? false)

const form = ref({
  name: '',
  description: '',
  shortDescription: '',
  price: null,
  compareAtPrice: null,
  categoryId: '',
  categoryName: '',
  parentCategoryId: null,
  parentCategoryName: '',
  images: [],
  stock: 0,
  isActive: true,
  isFeatured: false,
  freeShipping: false,
  tags: [],
})

// Predefined customization catalog — static options, admin only toggles enabled/required and sets extra prices
const CUSTOMIZATION_CATALOG = {
  grabado: { label: 'Grabado', options: ['Iniciales', 'Logo'] },
  tamano: { label: 'Tamaño', options: ['Chico', 'Mediano', 'Grande'] },
  virola: { label: 'Virola', options: ['Cordón galloneado', 'Galloneado ancho'] },
  color: { label: 'Color', options: ['Claro', 'Oscuro'] },
}

function createDefaultCustSettings() {
  const settings = {}
  for (const [id, cat] of Object.entries(CUSTOMIZATION_CATALOG)) {
    settings[id] = {
      enabled: false,
      required: false,
      options: cat.options.map(v => ({ value: v, extraPrice: 0 })),
    }
  }
  return settings
}

const custSettings = ref(createDefaultCustSettings())

// Show PERSONALIZACION only for Mate category
const isMateCategory = computed(() => {
  if (!selectedParentId.value) return false
  const parent = props.categories.find(c => c.id === selectedParentId.value)
  return parent?.name?.toLowerCase() === 'mate'
})

const unlimitedStock = ref(false)
const tagsInput = ref('')
const selectedParentId = ref('')
const selectedChildId = ref('')

// Featured limit check
const { get: apiFetch } = useApi()
const featuredCount = ref(0)

onMounted(async () => {
  try {
    const all = await apiFetch('/api/products/all')
    featuredCount.value = all.filter(p => p.isFeatured).length
  } catch (e) {
    // API will still enforce the limit on save
  }
})

const canToggleFeatured = computed(() => {
  if (form.value.isFeatured) return true
  const effectiveCount = props.product?.isFeatured
    ? featuredCount.value - 1
    : featuredCount.value
  return effectiveCount < 10
})

// Slug generation
const generatedSlug = computed(() => {
  if (!form.value.name) return ''
  return form.value.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
})

// Image folder: from existing product, or generated from slug
const imageFolder = computed(() => {
  if (props.product?.cloudinaryFolder) return props.product.cloudinaryFolder
  return generatedSlug.value || 'unsorted'
})

// ─── Videos ───
const localVideos = ref([])

function extractYouTubeId(url) {
  if (!url || typeof url !== 'string') return null
  const patterns = [
    /youtube\.com\/watch\?v=([^&#]+)/,
    /youtu\.be\/([^?&#]+)/,
    /youtube\.com\/shorts\/([^?&#]+)/,
    /youtube\.com\/embed\/([^?&#]+)/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

function addVideo() {
  localVideos.value.push({ url: '', title: '', embedId: '', type: 'youtube', order: localVideos.value.length, _error: '' })
}

function removeVideo(index) {
  localVideos.value.splice(index, 1)
  localVideos.value.forEach((v, i) => { v.order = i })
}

function onVideoUrlBlur(video) {
  if (!video.url) {
    video.embedId = ''
    video._error = ''
    return
  }
  const id = extractYouTubeId(video.url)
  if (id) {
    video.embedId = id
    video._error = ''
  } else {
    video.embedId = ''
    video._error = 'URL de YouTube inválida'
  }
}

// Children of selected parent
const selectedParentChildren = computed(() => {
  if (!selectedParentId.value) return []
  const parent = props.categories.find(c => c.id === selectedParentId.value)
  return parent?.children || []
})

// When parent changes
function onParentChange() {
  selectedChildId.value = ''
  // Reset customizations when switching away from Mate
  const parent = props.categories.find(c => c.id === selectedParentId.value)
  if (parent?.name?.toLowerCase() !== 'mate') {
    custSettings.value = createDefaultCustSettings()
  }
  if (!parent) return

  // If parent has no children, assign directly to parent
  if (!parent.children || parent.children.length === 0) {
    form.value.categoryId = parent.id
    form.value.categoryName = parent.name
    form.value.parentCategoryId = null
    form.value.parentCategoryName = ''
  } else {
    // Clear until child is selected
    form.value.categoryId = ''
    form.value.categoryName = ''
    form.value.parentCategoryId = parent.id
    form.value.parentCategoryName = parent.name
  }
}

// When child changes
function onChildChange() {
  const parent = props.categories.find(c => c.id === selectedParentId.value)
  const child = parent?.children?.find(c => c.id === selectedChildId.value)
  if (!child || !parent) return

  form.value.categoryId = child.id
  form.value.categoryName = child.name
  form.value.parentCategoryId = parent.id
  form.value.parentCategoryName = parent.name
}

// Populate form when product prop is provided (edit mode)
watch(() => props.product, (product) => {
  if (product) {
    form.value = {
      name: product.name || '',
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      price: product.price ?? null,
      compareAtPrice: product.compareAtPrice ?? null,
      categoryId: product.categoryId || '',
      categoryName: product.categoryName || '',
      parentCategoryId: product.parentCategoryId || null,
      parentCategoryName: product.parentCategoryName || '',
      images: product.images || [],
      stock: product.stock === -1 ? 0 : (product.stock ?? 0),
      isActive: product.isActive ?? true,
      isFeatured: product.isFeatured ?? false,
      freeShipping: product.freeShipping ?? false,
      tags: product.tags || [],
    }
    unlimitedStock.value = product.stock === -1
    tagsInput.value = (product.tags || []).join(', ')

    // Populate videos
    localVideos.value = (product.videos || []).map((v, i) => ({
      url: v.url || '',
      title: v.title || '',
      embedId: v.embedId || '',
      type: v.type || 'youtube',
      order: v.order ?? i,
      _error: '',
    }))

    // Populate customization settings from saved product data
    const freshSettings = createDefaultCustSettings()
    if (product.customizations?.length) {
      for (const cust of product.customizations) {
        if (freshSettings[cust.id]) {
          freshSettings[cust.id].enabled = true
          freshSettings[cust.id].required = cust.required || false
          for (const opt of cust.options || []) {
            const s = freshSettings[cust.id].options.find(o => o.value === opt.value)
            if (s) s.extraPrice = opt.extraPrice || 0
          }
        }
      }
    }
    custSettings.value = freshSettings

    // Set cascading dropdown state from existing product data
    if (product.parentCategoryId) {
      selectedParentId.value = product.parentCategoryId
      selectedChildId.value = product.categoryId
    } else if (product.categoryId) {
      // Product is assigned directly to a parent (no children)
      selectedParentId.value = product.categoryId
      selectedChildId.value = ''
    }
  }
}, { immediate: true })

// Sync stock with unlimited checkbox
watch(unlimitedStock, (val) => {
  if (val) form.value.stock = -1
  else if (form.value.stock === -1) form.value.stock = 0
})

function handleSubmit() {
  // Parse tags from input
  const tags = tagsInput.value
    ? tagsInput.value.split(',').map(t => t.trim()).filter(Boolean)
    : []

  // Build customizations from enabled catalog entries
  const customizations = Object.entries(custSettings.value)
    .filter(([_, s]) => s.enabled)
    .map(([id, s]) => ({
      id,
      label: CUSTOMIZATION_CATALOG[id].label,
      type: 'select',
      required: s.required,
      options: s.options.map(o => ({ value: o.value, extraPrice: o.extraPrice || 0 })),
    }))

  // Filter valid videos (with URL and embedId)
  const videos = localVideos.value
    .filter(v => v.url && v.embedId)
    .map(({ _error, ...v }) => v)

  const data = {
    ...form.value,
    stock: unlimitedStock.value ? -1 : form.value.stock,
    tags,
    customizations,
    videos,
    compareAtPrice: form.value.compareAtPrice || null,
    cloudinaryFolder: imageFolder.value,
  }

  emit('save', data)
}
</script>
