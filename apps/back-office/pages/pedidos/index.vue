<template>
  <div>
    <NuxtLayout name="admin">
      <h2 class="font-display text-brand-primary text-2xl mb-6">PEDIDOS</h2>

      <!-- Filters -->
      <div class="flex flex-col sm:flex-row gap-3 mb-6">
        <!-- Search -->
        <div class="flex-1">
          <input
            v-model="search"
            type="text"
            placeholder="Buscar por cliente, telefono o numero de pedido"
            class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
          />
        </div>

        <!-- Status filter -->
        <select
          v-model="statusFilter"
          class="px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
        >
          <option value="">Todos</option>
          <option value="nuevo">Nuevos</option>
          <option value="contactado">Contactados</option>
          <option value="en_conversacion">En conversacion</option>
          <option value="confirmado">Confirmados</option>
          <option value="pagado">Pagados</option>
          <option value="enviado">Enviados</option>
          <option value="entregado">Entregados</option>
          <option value="cancelado">Cancelados</option>
        </select>

        <!-- Sort -->
        <select
          v-model="sortBy"
          class="px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
        >
          <option value="newest">Mas recientes</option>
          <option value="oldest">Mas antiguos</option>
          <option value="highest">Mayor valor</option>
          <option value="lowest">Menor valor</option>
        </select>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 5" :key="i" class="bg-white border-2 border-brand-olive/10 p-4 animate-pulse">
          <div class="flex gap-4">
            <div class="h-4 w-20 bg-brand-olive/5" />
            <div class="h-4 w-32 bg-brand-olive/5" />
            <div class="h-4 w-16 bg-brand-olive/5" />
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="filteredOrders.length === 0" class="bg-white border-2 border-brand-olive/10 p-12 text-center">
        <p class="font-sans text-brand-olive/60 text-sm">
          {{ orders.length === 0 ? 'No hay pedidos todavia.' : 'No se encontraron pedidos con esos filtros.' }}
        </p>
      </div>

      <!-- Desktop table -->
      <div v-else class="hidden md:block">
        <table class="w-full">
          <thead>
            <tr class="border-b-2 border-brand-olive/10">
              <th class="text-left font-sans text-xs uppercase tracking-wide text-brand-olive/60 pb-3 pr-4">Pedido</th>
              <th class="text-left font-sans text-xs uppercase tracking-wide text-brand-olive/60 pb-3 pr-4">Cliente</th>
              <th class="text-left font-sans text-xs uppercase tracking-wide text-brand-olive/60 pb-3 pr-4">Fecha</th>
              <th class="text-left font-sans text-xs uppercase tracking-wide text-brand-olive/60 pb-3 pr-4">Items</th>
              <th class="text-left font-sans text-xs uppercase tracking-wide text-brand-olive/60 pb-3 pr-4">Total</th>
              <th class="text-left font-sans text-xs uppercase tracking-wide text-brand-olive/60 pb-3 pr-4">Estado</th>
              <th class="text-right font-sans text-xs uppercase tracking-wide text-brand-olive/60 pb-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="order in filteredOrders"
              :key="order.id"
              class="border-b border-brand-olive/5 hover:bg-white/50 transition-colors"
            >
              <!-- Order number -->
              <td class="py-3 pr-4">
                <NuxtLink
                  :to="`/pedidos/${order.id}`"
                  class="font-sans text-sm font-semibold text-brand-primary hover:underline"
                >
                  {{ order.orderNumber }}
                </NuxtLink>
              </td>

              <!-- Customer -->
              <td class="py-3 pr-4">
                <p class="font-sans text-sm text-brand-olive">{{ order.customer?.name }}</p>
                <p class="font-sans text-xs text-brand-olive/50">{{ order.customer?.phone }}</p>
              </td>

              <!-- Date -->
              <td class="py-3 pr-4">
                <span class="font-sans text-sm text-brand-olive/70">{{ formatDate(order.createdAt) }}</span>
              </td>

              <!-- Items -->
              <td class="py-3 pr-4">
                <span class="font-sans text-sm text-brand-olive/70">{{ order.totalItems }} {{ order.totalItems === 1 ? 'producto' : 'productos' }}</span>
              </td>

              <!-- Total -->
              <td class="py-3 pr-4">
                <span class="font-sans text-sm font-medium text-brand-olive">{{ formatPrice(order.adjustedAmount || order.totalAmount) }}</span>
                <p v-if="order.paymentMethod" class="font-sans text-xs text-brand-olive/50">{{ order.paymentMethod }}</p>
              </td>

              <!-- Status -->
              <td class="py-3 pr-4">
                <AdminOrderStatusSelect
                  :current-status="order.status"
                  :order-id="order.id"
                  size="sm"
                  @updated="(updated) => onStatusUpdated(order, updated)"
                />
              </td>

              <!-- Actions -->
              <td class="py-3 text-right">
                <div class="flex items-center justify-end gap-2">
                  <!-- WhatsApp -->
                  <button
                    @click="openWhatsApp(order)"
                    class="p-1.5 text-green-600 hover:bg-green-50 transition-colors"
                    :title="`Abrir chat con ${order.customer?.name}`"
                  >
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </button>

                  <!-- View -->
                  <NuxtLink
                    :to="`/pedidos/${order.id}`"
                    class="p-1.5 text-brand-olive/50 hover:text-brand-primary transition-colors"
                    title="Ver pedido"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="square" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="square" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </NuxtLink>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile cards -->
      <div v-if="!loading && filteredOrders.length > 0" class="md:hidden space-y-3">
        <NuxtLink
          v-for="order in filteredOrders"
          :key="order.id"
          :to="`/pedidos/${order.id}`"
          class="block bg-white border-2 border-brand-olive/10 p-4 hover:border-brand-olive/20 transition-colors"
        >
          <div class="flex items-start justify-between mb-2">
            <span class="font-sans text-sm font-semibold text-brand-primary">{{ order.orderNumber }}</span>
            <AdminStatusBadge :status="order.status" type="order" />
          </div>
          <p class="font-sans text-sm text-brand-olive mb-1">{{ order.customer?.name }}</p>
          <div class="flex items-center justify-between">
            <span class="font-sans text-xs text-brand-olive/50">
              {{ formatDate(order.createdAt) }} · {{ order.totalItems }} {{ order.totalItems === 1 ? 'producto' : 'productos' }}
            </span>
            <div class="text-right">
              <span class="font-sans text-sm font-medium text-brand-olive">{{ formatPrice(order.adjustedAmount || order.totalAmount) }}</span>
              <p v-if="order.paymentMethod" class="font-sans text-xs text-brand-olive/50">{{ order.paymentMethod }}</p>
            </div>
          </div>
        </NuxtLink>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup>
import { formatPrice } from '~/utils/format'

const route = useRoute()
const router = useRouter()
const { get } = useApi()

const loading = ref(true)
const orders = ref([])
const search = ref('')
const statusFilter = ref(route.query.status || '')
const sortBy = ref('newest')

// Sync status filter with URL
watch(statusFilter, (val) => {
  router.replace({ query: val ? { status: val } : {} })
})

const filteredOrders = computed(() => {
  let result = [...orders.value]

  // Status filter
  if (statusFilter.value) {
    result = result.filter(o => o.status === statusFilter.value)
  }

  // Search
  if (search.value.trim()) {
    const q = search.value.toLowerCase().trim()
    result = result.filter(o =>
      (o.customer?.name || '').toLowerCase().includes(q) ||
      (o.customer?.phone || '').includes(q) ||
      (o.orderNumber || '').toLowerCase().includes(q)
    )
  }

  // Sort
  switch (sortBy.value) {
    case 'oldest':
      result.sort((a, b) => toTimestamp(a.createdAt) - toTimestamp(b.createdAt))
      break
    case 'highest':
      result.sort((a, b) => (b.adjustedAmount || b.totalAmount || 0) - (a.adjustedAmount || a.totalAmount || 0))
      break
    case 'lowest':
      result.sort((a, b) => (a.adjustedAmount || a.totalAmount || 0) - (b.adjustedAmount || b.totalAmount || 0))
      break
    default: // newest
      result.sort((a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt))
  }

  return result
})

function toTimestamp(date) {
  if (!date) return 0
  if (date._seconds) return date._seconds * 1000
  if (date.seconds) return date.seconds * 1000
  return new Date(date).getTime()
}

function formatDate(date) {
  if (!date) return ''
  const ms = toTimestamp(date)
  const d = new Date(ms)
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${d.getDate()} ${months[d.getMonth()]}, ${hours}:${minutes}`
}

function openWhatsApp(order) {
  const phone = (order.customer?.phone || '').replace(/\D/g, '')
  const name = order.customer?.name || ''
  const text = encodeURIComponent(`Hola ${name}! Te escribo por tu pedido ${order.orderNumber} de El Gran Peon. `)
  window.open(`https://wa.me/54${phone}?text=${text}`, '_blank')
}

function onStatusUpdated(order, updated) {
  order.status = updated.status
}

onMounted(async () => {
  try {
    orders.value = await get('/api/orders')
  } catch (error) {
    console.error('Error loading orders:', error)
  } finally {
    loading.value = false
  }
})
</script>
