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
        <textarea
          v-model="form.description"
          rows="4"
          required
          class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors resize-vertical"
        />
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
          <label class="block font-sans text-sm text-brand-olive/70 mb-1">Precio (ARS) *</label>
          <input
            v-model.number="form.price"
            type="number"
            min="0"
            step="1"
            required
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
        v-model="form.images"
        :max-images="6"
        upload-endpoint="/api/upload/product-image"
        :folder="imageFolder"
      />
    </div>

    <!-- Section 5: Opciones -->
    <div class="mb-8">
      <h3 class="font-display text-brand-olive text-lg mb-4 uppercase">OPCIONES</h3>

      <div class="space-y-3 mb-5">
        <label class="flex items-center gap-3 cursor-pointer">
          <input
            v-model="form.isFeatured"
            type="checkbox"
            class="w-4 h-4 accent-brand-primary"
          />
          <span class="font-sans text-sm text-brand-olive">Destacado</span>
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
            v-model="form.bulkAvailable"
            type="checkbox"
            class="w-4 h-4 accent-brand-primary"
          />
          <span class="font-sans text-sm text-brand-olive">Disponible para mayoristas</span>
        </label>
      </div>

      <div v-if="form.bulkAvailable" class="mb-5">
        <label class="block font-sans text-sm text-brand-olive/70 mb-1">Cantidad minima mayorista</label>
        <input
          v-model.number="form.bulkMinQuantity"
          type="number"
          min="1"
          class="w-32 px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
        />
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
        :disabled="isLoading"
        class="px-6 py-2 bg-brand-primary text-brand-cream font-sans text-sm font-medium hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
      >
        {{ isLoading ? 'Guardando...' : 'Guardar Producto' }}
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
  bulkAvailable: false,
  bulkMinQuantity: null,
  tags: [],
})

const unlimitedStock = ref(false)
const tagsInput = ref('')
const selectedParentId = ref('')
const selectedChildId = ref('')

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

// Stable image folder: generated once for new products, or from existing product
const stableTimestamp = Date.now()
const imageFolder = computed(() => {
  if (props.product?.cloudinaryFolder) return props.product.cloudinaryFolder
  if (generatedSlug.value) return `${generatedSlug.value}-${stableTimestamp}`
  return `product-${stableTimestamp}`
})

// Children of selected parent
const selectedParentChildren = computed(() => {
  if (!selectedParentId.value) return []
  const parent = props.categories.find(c => c.id === selectedParentId.value)
  return parent?.children || []
})

// When parent changes
function onParentChange() {
  selectedChildId.value = ''
  const parent = props.categories.find(c => c.id === selectedParentId.value)
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
      bulkAvailable: product.bulkAvailable ?? false,
      bulkMinQuantity: product.bulkMinQuantity ?? null,
      tags: product.tags || [],
    }
    unlimitedStock.value = product.stock === -1
    tagsInput.value = (product.tags || []).join(', ')

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

  const data = {
    ...form.value,
    stock: unlimitedStock.value ? -1 : form.value.stock,
    tags,
    compareAtPrice: form.value.compareAtPrice || null,
    bulkMinQuantity: form.value.bulkAvailable ? form.value.bulkMinQuantity : null,
    cloudinaryFolder: imageFolder.value,
  }

  emit('save', data)
}
</script>
