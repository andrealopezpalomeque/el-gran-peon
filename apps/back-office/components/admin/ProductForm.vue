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

    <!-- Section 3: Categoria -->
    <div class="mb-8">
      <h3 class="font-display text-brand-olive text-lg mb-4 uppercase">CATEGORIA</h3>

      <div class="mb-5">
        <label class="block font-sans text-sm text-brand-olive/70 mb-1">Categoria *</label>
        <select
          v-model="form.categoryId"
          required
          class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
          @change="onCategoryChange"
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

// Image folder (from existing product or generated slug)
const imageFolder = computed(() => {
  if (props.product?.cloudinaryFolder) return props.product.cloudinaryFolder
  return generatedSlug.value || 'unsorted'
})

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
  }
}, { immediate: true })

// Sync stock with unlimited checkbox
watch(unlimitedStock, (val) => {
  if (val) form.value.stock = -1
  else if (form.value.stock === -1) form.value.stock = 0
})

function onCategoryChange() {
  const cat = props.categories.find(c => c.id === form.value.categoryId)
  if (cat) form.value.categoryName = cat.name
}

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
  }

  emit('save', data)
}
</script>
