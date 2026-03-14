<template>
  <NuxtLayout name="admin">
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/compras" class="text-brand-olive/50 hover:text-brand-primary transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="square" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </NuxtLink>
      <h2 class="font-sans text-brand-olive text-2xl font-semibold">Editar Compra</h2>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <p class="font-sans text-brand-olive/60 text-sm">Cargando compra...</p>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="max-w-2xl">
      <!-- Read-only purchase details -->
      <div class="mb-6 p-4 border-2 border-brand-olive/10 bg-brand-olive/5">
        <p class="font-sans text-xs text-brand-olive/50 mb-3">Datos de la compra (solo lectura)</p>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="font-sans text-xs text-brand-olive/50">Producto</p>
            <p class="font-sans text-sm text-brand-olive font-medium">{{ purchase.productName }}</p>
            <p v-if="purchase.productSku" class="font-sans text-xs text-brand-olive/40">{{ purchase.productSku }}</p>
          </div>
          <div>
            <p class="font-sans text-xs text-brand-olive/50">Cantidad</p>
            <p class="font-sans text-sm text-brand-olive font-medium">{{ purchase.quantity }}</p>
          </div>
          <div>
            <p class="font-sans text-xs text-brand-olive/50">Precio unitario</p>
            <p class="font-sans text-sm text-brand-olive font-medium">{{ formatPrice(purchase.unitPrice) }}</p>
          </div>
          <div>
            <p class="font-sans text-xs text-brand-olive/50">Total pagado</p>
            <p class="font-sans text-sm text-brand-primary font-semibold">{{ formatPrice(purchase.totalPaid) }}</p>
          </div>
        </div>
      </div>

      <!-- Editable: Date -->
      <div class="mb-5">
        <label class="block font-sans text-sm text-brand-olive/70 mb-1">Fecha *</label>
        <input
          v-model="form.date"
          type="date"
          required
          class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
        />
      </div>

      <!-- Editable: Supplier -->
      <div class="mb-5">
        <label class="block font-sans text-sm text-brand-olive/70 mb-1">Proveedor</label>
        <input
          v-model="form.supplier"
          type="text"
          placeholder="Nombre del proveedor"
          class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
        />
      </div>

      <!-- Editable: Notes -->
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
          {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
        </button>
        <NuxtLink
          to="/compras"
          class="px-6 py-2 font-sans text-sm text-brand-olive border-2 border-brand-olive/20 hover:border-brand-olive/40 transition-colors"
        >
          Cancelar
        </NuxtLink>
        <button
          type="button"
          @click="confirmDelete"
          class="ml-auto px-6 py-2 font-sans text-sm text-red-700 border-2 border-red-300 hover:bg-red-700 hover:text-white transition-colors"
        >
          Eliminar
        </button>
      </div>

      <p v-if="error" class="mt-4 font-sans text-red-600 text-sm">{{ error }}</p>
    </form>

    <AdminConfirmModal
      :visible="showDeleteModal"
      title="Eliminar compra"
      :message="`Se eliminara la compra de '${purchase.productName}'. Los cambios de stock y costo NO se revertiran.`"
      @confirm="deletePurchase"
      @cancel="showDeleteModal = false"
    />
  </NuxtLayout>
</template>

<script setup>
import { formatPrice } from '~/utils/format'

const { get, put, delete: apiDelete } = useApi()
const route = useRoute()
const router = useRouter()

const purchase = ref({})
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const showDeleteModal = ref(false)

const form = reactive({
  date: '',
  supplier: '',
  notes: '',
})

function confirmDelete() {
  showDeleteModal.value = true
}

async function deletePurchase() {
  try {
    await apiDelete(`/api/purchases/${route.params.id}`)
    router.push('/compras')
  } catch (err) {
    console.error('Error deleting purchase:', err)
    alert(err.message || 'Error al eliminar la compra')
  } finally {
    showDeleteModal.value = false
  }
}

async function handleSubmit() {
  saving.value = true
  error.value = ''

  try {
    await put(`/api/purchases/${route.params.id}`, {
      date: form.date,
      supplier: form.supplier,
      notes: form.notes,
    })
    router.push('/compras')
  } catch (err) {
    console.error('Error updating purchase:', err)
    error.value = err.message || 'Error al actualizar la compra'
  } finally {
    saving.value = false
  }
}

async function loadPurchase() {
  loading.value = true
  try {
    const data = await get(`/api/purchases/${route.params.id}`)
    purchase.value = data
    form.date = data.date || ''
    form.supplier = data.supplier || ''
    form.notes = data.notes || ''
  } catch (err) {
    console.error('Error loading purchase:', err)
    error.value = 'Error al cargar la compra'
  } finally {
    loading.value = false
  }
}

onMounted(loadPurchase)
</script>
