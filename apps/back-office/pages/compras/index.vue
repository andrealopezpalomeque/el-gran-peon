<template>
  <NuxtLayout name="admin">
    <div class="flex items-center justify-between mb-6">
      <h2 class="font-sans text-brand-olive text-2xl font-semibold">Compras</h2>
      <NuxtLink
        to="/compras/nueva"
        class="px-5 py-2 bg-brand-primary text-brand-cream font-sans text-sm font-medium hover:bg-brand-primary/90 transition-colors"
      >
        Nueva Compra
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap items-center gap-4 mb-6 pb-4 border-b-2 border-brand-olive/10">
      <!-- Date from -->
      <div>
        <label class="block font-sans text-xs text-brand-olive/50 mb-1">Desde</label>
        <input
          v-model="filterDateFrom"
          type="date"
          class="px-3 py-1.5 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
        />
      </div>
      <!-- Date to -->
      <div>
        <label class="block font-sans text-xs text-brand-olive/50 mb-1">Hasta</label>
        <input
          v-model="filterDateTo"
          type="date"
          class="px-3 py-1.5 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
        />
      </div>
      <!-- Supplier search -->
      <div>
        <label class="block font-sans text-xs text-brand-olive/50 mb-1">Proveedor</label>
        <input
          v-model="filterSupplier"
          type="text"
          placeholder="Buscar proveedor..."
          class="w-40 px-3 py-1.5 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
        />
      </div>
      <!-- Product search -->
      <div>
        <label class="block font-sans text-xs text-brand-olive/50 mb-1">Producto</label>
        <input
          v-model="filterProduct"
          type="text"
          placeholder="Buscar producto..."
          class="w-40 px-3 py-1.5 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
        />
      </div>
      <span class="font-sans text-xs text-brand-olive/40 ml-auto self-end pb-1">
        {{ filteredPurchases.length }} {{ filteredPurchases.length === 1 ? 'compra' : 'compras' }}
      </span>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <p class="font-sans text-brand-olive/60 text-sm">Cargando compras...</p>
    </div>

    <!-- Empty -->
    <div v-else-if="purchases.length === 0" class="text-center py-12">
      <p class="font-sans text-brand-olive/60 text-sm mb-4">No hay compras registradas.</p>
      <NuxtLink
        to="/compras/nueva"
        class="inline-block px-5 py-2 bg-brand-primary text-brand-cream font-sans text-sm font-medium hover:bg-brand-primary/90 transition-colors"
      >
        Registrar primera compra
      </NuxtLink>
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b-2 border-brand-olive/10">
            <th class="text-left font-sans text-xs uppercase tracking-wide text-brand-olive/60 py-3 pr-4">Fecha</th>
            <th class="text-left font-sans text-xs uppercase tracking-wide text-brand-olive/60 py-3 pr-4">Producto</th>
            <th class="text-center font-sans text-xs uppercase tracking-wide text-brand-olive/60 py-3 pr-4">Cantidad</th>
            <th class="text-right font-sans text-xs uppercase tracking-wide text-brand-olive/60 py-3 pr-4">P. Unitario</th>
            <th class="text-right font-sans text-xs uppercase tracking-wide text-brand-olive/60 py-3 pr-4">Total</th>
            <th class="text-left font-sans text-xs uppercase tracking-wide text-brand-olive/60 py-3 pr-4">Proveedor</th>
            <th class="text-right font-sans text-xs uppercase tracking-wide text-brand-olive/60 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="purchase in filteredPurchases"
            :key="purchase.id"
            class="border-b border-brand-olive/5"
          >
            <td class="py-3 pr-4">
              <span class="font-sans text-sm text-brand-olive">{{ formatDate(purchase.date) }}</span>
            </td>
            <td class="py-3 pr-4">
              <span class="font-sans text-sm text-brand-olive font-medium">{{ purchase.productName }}</span>
              <span v-if="purchase.productSku" class="block font-sans text-xs text-brand-olive/40">{{ purchase.productSku }}</span>
            </td>
            <td class="py-3 pr-4 text-center">
              <span class="font-sans text-sm text-brand-olive">{{ purchase.quantity }}</span>
            </td>
            <td class="py-3 pr-4 text-right">
              <span class="font-sans text-sm text-brand-olive/70">{{ formatPrice(purchase.unitPrice) }}</span>
            </td>
            <td class="py-3 pr-4 text-right">
              <span class="font-sans text-sm text-brand-olive font-medium">{{ formatPrice(purchase.totalPaid) }}</span>
            </td>
            <td class="py-3 pr-4">
              <span class="font-sans text-sm text-brand-olive/60">{{ purchase.supplier || '—' }}</span>
            </td>
            <td class="py-3 text-right">
              <div class="flex items-center justify-end gap-2">
                <NuxtLink
                  :to="`/compras/${purchase.id}`"
                  class="px-3 py-1 font-sans text-xs text-brand-primary border border-brand-primary/30 hover:bg-brand-primary hover:text-brand-cream transition-colors"
                >
                  Editar
                </NuxtLink>
                <button
                  type="button"
                  @click="confirmDelete(purchase)"
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
      title="Eliminar compra"
      :message="`Se eliminara la compra de '${purchaseToDelete?.productName}'. Los cambios de stock y costo NO se revertiran.`"
      @confirm="deletePurchase"
      @cancel="showDeleteModal = false"
    />
  </NuxtLayout>
</template>

<script setup>
import { formatPrice } from '~/utils/format'

const { get, delete: apiDelete } = useApi()

const purchases = ref([])
const loading = ref(true)
const showDeleteModal = ref(false)
const purchaseToDelete = ref(null)

// Filters
const filterDateFrom = ref('')
const filterDateTo = ref('')
const filterSupplier = ref('')
const filterProduct = ref('')

const filteredPurchases = computed(() => {
  let result = purchases.value

  if (filterDateFrom.value) {
    result = result.filter(p => p.date >= filterDateFrom.value)
  }

  if (filterDateTo.value) {
    result = result.filter(p => p.date <= filterDateTo.value)
  }

  if (filterSupplier.value.trim()) {
    const q = filterSupplier.value.trim().toLowerCase()
    result = result.filter(p => p.supplier?.toLowerCase().includes(q))
  }

  if (filterProduct.value.trim()) {
    const q = filterProduct.value.trim().toLowerCase()
    result = result.filter(p =>
      p.productName?.toLowerCase().includes(q) ||
      p.productSku?.toLowerCase().includes(q)
    )
  }

  return result
})

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const date = new Date(dateStr + 'T12:00:00')
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}

function confirmDelete(purchase) {
  purchaseToDelete.value = purchase
  showDeleteModal.value = true
}

async function deletePurchase() {
  if (!purchaseToDelete.value) return

  try {
    await apiDelete(`/api/purchases/${purchaseToDelete.value.id}`)
    purchases.value = purchases.value.filter(p => p.id !== purchaseToDelete.value.id)
  } catch (error) {
    console.error('Error deleting purchase:', error)
    alert(error.message || 'Error al eliminar la compra')
  } finally {
    showDeleteModal.value = false
    purchaseToDelete.value = null
  }
}

async function loadData() {
  loading.value = true
  try {
    purchases.value = await get('/api/purchases')
  } catch (error) {
    console.error('Error loading purchases:', error)
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>
