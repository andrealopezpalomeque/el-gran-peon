<template>
  <NuxtLayout name="admin">
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/compras" class="text-brand-olive/50 hover:text-brand-primary transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="square" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </NuxtLink>
      <h2 class="font-sans text-brand-olive text-2xl font-semibold">Nueva Compra</h2>
    </div>

    <form @submit.prevent="handleSubmit" class="max-w-2xl">
      <!-- Date -->
      <div class="mb-5">
        <label class="block font-sans text-sm text-brand-olive/70 mb-1">Fecha *</label>
        <input
          v-model="form.date"
          type="date"
          required
          class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
        />
      </div>

      <!-- Product dropdown -->
      <div class="mb-5">
        <label class="block font-sans text-sm text-brand-olive/70 mb-1">Producto *</label>
        <select
          v-model="selectedProductId"
          required
          class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
          @change="onProductSelect"
        >
          <option value="" disabled>Seleccionar producto</option>
          <option v-for="p in products" :key="p.id" :value="p.id">
            {{ p.sku ? `[${p.sku}] ` : '' }}{{ p.name }}
          </option>
        </select>
      </div>

      <!-- Show current stock & cost of selected product -->
      <div v-if="selectedProduct" class="mb-5 p-4 border-2 border-brand-olive/10 bg-brand-olive/5">
        <div class="flex gap-6">
          <div>
            <p class="font-sans text-xs text-brand-olive/50">Stock actual</p>
            <p class="font-sans text-sm text-brand-olive font-medium">{{ selectedProduct.stock === -1 ? 'Ilimitado' : selectedProduct.stock }}</p>
          </div>
          <div>
            <p class="font-sans text-xs text-brand-olive/50">Costo actual</p>
            <p class="font-sans text-sm text-brand-olive font-medium">{{ selectedProduct.cost ? formatPrice(selectedProduct.cost) : '—' }}</p>
          </div>
          <div>
            <p class="font-sans text-xs text-brand-olive/50">Precio venta</p>
            <p class="font-sans text-sm text-brand-olive font-medium">{{ selectedProduct.price ? formatPrice(selectedProduct.price) : 'A consultar' }}</p>
          </div>
        </div>
      </div>

      <!-- Quantity and unit price -->
      <div class="grid grid-cols-2 gap-5 mb-5">
        <div>
          <label class="block font-sans text-sm text-brand-olive/70 mb-1">Cantidad *</label>
          <input
            v-model.number="form.quantity"
            type="number"
            min="1"
            required
            class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
          />
        </div>
        <div>
          <label class="block font-sans text-sm text-brand-olive/70 mb-1">Precio unitario (ARS) *</label>
          <input
            v-model.number="form.unitPrice"
            type="number"
            min="0"
            step="1"
            required
            class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
          />
        </div>
      </div>

      <!-- Calculated total -->
      <div v-if="form.quantity && form.unitPrice" class="mb-5 p-4 border-2 border-brand-primary/20 bg-brand-primary/5">
        <p class="font-sans text-xs text-brand-olive/50 mb-1">Total de la compra</p>
        <p class="font-sans text-xl font-semibold text-brand-primary">{{ formatPrice(form.quantity * form.unitPrice) }}</p>
      </div>

      <!-- Supplier -->
      <div class="mb-5">
        <label class="block font-sans text-sm text-brand-olive/70 mb-1">Proveedor</label>
        <input
          v-model="form.supplier"
          type="text"
          placeholder="Nombre del proveedor"
          class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
        />
      </div>

      <!-- Notes -->
      <div class="mb-5">
        <label class="block font-sans text-sm text-brand-olive/70 mb-1">Notas</label>
        <textarea
          v-model="form.notes"
          rows="3"
          placeholder="Notas adicionales..."
          class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors resize-vertical"
        />
      </div>

      <!-- Actions -->
      <div class="flex gap-3 pt-4 border-t-2 border-brand-olive/10">
        <button
          type="submit"
          :disabled="saving"
          class="px-6 py-2 bg-brand-primary text-brand-cream font-sans text-sm font-medium hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
        >
          {{ saving ? 'Guardando...' : 'Registrar Compra' }}
        </button>
        <NuxtLink
          to="/compras"
          class="px-6 py-2 font-sans text-sm text-brand-olive border-2 border-brand-olive/20 hover:border-brand-olive/40 transition-colors"
        >
          Cancelar
        </NuxtLink>
      </div>

      <p v-if="error" class="mt-4 font-sans text-red-600 text-sm">{{ error }}</p>
    </form>
  </NuxtLayout>
</template>

<script setup>
import { formatPrice } from '~/utils/format'

const { get, post } = useApi()
const router = useRouter()

const products = ref([])
const selectedProductId = ref('')
const saving = ref(false)
const error = ref('')

const form = reactive({
  date: new Date().toISOString().split('T')[0],
  productId: '',
  productName: '',
  productSku: '',
  quantity: null,
  unitPrice: null,
  supplier: '',
  notes: '',
})

const selectedProduct = computed(() => {
  if (!selectedProductId.value) return null
  return products.value.find(p => p.id === selectedProductId.value)
})

function onProductSelect() {
  const product = selectedProduct.value
  if (product) {
    form.productId = product.id
    form.productName = product.name
    form.productSku = product.sku || ''
  }
}

async function handleSubmit() {
  saving.value = true
  error.value = ''

  try {
    await post('/api/purchases', {
      date: form.date,
      productId: form.productId,
      productName: form.productName,
      productSku: form.productSku,
      quantity: form.quantity,
      unitPrice: form.unitPrice,
      totalPaid: form.quantity * form.unitPrice,
      supplier: form.supplier,
      notes: form.notes,
    })
    router.push('/compras')
  } catch (err) {
    console.error('Error creating purchase:', err)
    error.value = err.message || 'Error al registrar la compra'
  } finally {
    saving.value = false
  }
}

async function loadProducts() {
  try {
    products.value = await get('/api/products/all')
  } catch (err) {
    console.error('Error loading products:', err)
    error.value = 'Error al cargar productos'
  }
}

onMounted(loadProducts)
</script>
