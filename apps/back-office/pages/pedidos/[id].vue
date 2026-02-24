<template>
  <div>
    <NuxtLayout name="admin">
      <!-- Loading -->
      <div v-if="loading" class="animate-pulse space-y-6">
        <div class="h-6 w-48 bg-brand-olive/5" />
        <div class="bg-white border-2 border-brand-olive/10 p-6">
          <div class="h-4 w-64 bg-brand-olive/5 mb-3" />
          <div class="h-4 w-40 bg-brand-olive/5" />
        </div>
      </div>

      <template v-else-if="order">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div class="flex items-center gap-3">
            <NuxtLink to="/pedidos" class="text-brand-olive/50 hover:text-brand-primary transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="square" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </NuxtLink>
            <h2 class="font-display text-brand-primary text-2xl">{{ order.orderNumber }}</h2>
            <AdminStatusBadge :status="order.status" type="order" />
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="openWhatsApp"
              class="px-4 py-2 bg-green-600 text-white font-sans text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left column: Customer + Items -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Customer Section -->
            <div class="bg-white border-2 border-brand-olive/10 p-6">
              <h3 class="font-sans text-xs uppercase tracking-wide text-brand-olive/60 mb-4">Datos del cliente</h3>
              <p class="font-sans text-lg font-semibold text-brand-olive mb-3">{{ order.customer?.name }}</p>
              <div class="space-y-2">
                <div v-if="order.customer?.phone" class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-brand-olive/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="square" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span class="font-sans text-sm text-brand-olive">+54 {{ order.customer.phone }}</span>
                </div>
                <div v-if="order.customer?.email" class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-brand-olive/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="square" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a :href="`mailto:${order.customer.email}`" class="font-sans text-sm text-brand-primary hover:underline">{{ order.customer.email }}</a>
                </div>
                <div v-if="fullAddress" class="flex items-start gap-2">
                  <svg class="w-4 h-4 text-brand-olive/40 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="square" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="square" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span class="font-sans text-sm text-brand-olive">{{ fullAddress }}</span>
                </div>
                <div v-if="order.customer?.notes" class="mt-3 pt-3 border-t border-brand-olive/10">
                  <p class="font-sans text-xs text-brand-olive/50 mb-1">Notas del cliente:</p>
                  <p class="font-sans text-sm text-brand-olive">{{ order.customer.notes }}</p>
                </div>
              </div>
              <div v-if="order.paymentMethod" class="mt-3 pt-3 border-t border-brand-olive/10">
                <p class="font-sans text-xs text-brand-olive/50 mb-1">Metodo de pago:</p>
                <p class="font-sans text-sm text-brand-olive">{{ order.paymentMethod }}</p>
              </div>
              <div class="mt-4 pt-3 border-t border-brand-olive/10 flex items-center gap-4 text-xs text-brand-olive/50 font-sans">
                <span>Pedido: {{ order.orderNumber }}</span>
                <span>Fecha: {{ formatDate(order.createdAt) }}</span>
                <span v-if="order.source">Origen: {{ order.source }}</span>
              </div>
            </div>

            <!-- Order Items Section -->
            <div class="bg-white border-2 border-brand-olive/10 p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-sans text-xs uppercase tracking-wide text-brand-olive/60">Productos del pedido</h3>
                <label class="flex items-center gap-2 cursor-pointer">
                  <span class="font-sans text-xs text-brand-olive/60">Editar pedido</span>
                  <input v-model="editMode" type="checkbox" class="w-4 h-4 accent-brand-primary" />
                </label>
              </div>

              <!-- Items table -->
              <table class="w-full mb-4">
                <thead>
                  <tr class="border-b border-brand-olive/10">
                    <th class="text-left font-sans text-xs text-brand-olive/50 pb-2 pr-3">Producto</th>
                    <th class="text-center font-sans text-xs text-brand-olive/50 pb-2 px-2">Cant.</th>
                    <th class="text-right font-sans text-xs text-brand-olive/50 pb-2 px-2">P. Unit.</th>
                    <th class="text-right font-sans text-xs text-brand-olive/50 pb-2 pl-2">Subtotal</th>
                    <th v-if="editMode" class="pb-2 w-8" />
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item, idx) in editableItems"
                    :key="idx"
                    class="border-b border-brand-olive/5"
                  >
                    <td class="py-2 pr-3">
                      <p class="font-sans text-sm text-brand-olive">{{ item.name || item.productName }}</p>
                      <p v-if="item.category" class="font-sans text-xs text-brand-olive/40">{{ item.category }}</p>
                      <template v-if="item.customizations">
                        <p v-for="(c, key) in item.customizations" :key="key" class="font-sans text-xs text-brand-olive/60">
                          {{ c.label }}: {{ c.value }}
                          <template v-if="c.text"> — "{{ c.text }}"</template>
                          <span v-if="c.extraPrice > 0" class="text-brand-olive/40">(+{{ formatPrice(c.extraPrice) }})</span>
                        </p>
                        <a
                          v-if="item.customizations.grabado?.logoUrl"
                          :href="item.customizations.grabado.logoUrl"
                          target="_blank"
                          class="inline-block mt-1"
                        >
                          <img :src="item.customizations.grabado.logoUrl" alt="Logo del cliente" class="w-12 h-12 object-contain border border-brand-olive/10" />
                        </a>
                      </template>
                      <p v-if="item.freeShipping" class="font-sans text-xs text-brand-primary/80">Envío gratis</p>
                    </td>
                    <td class="py-2 px-2 text-center">
                      <template v-if="editMode">
                        <div class="flex items-center justify-center gap-1">
                          <button
                            @click="decrementQty(idx)"
                            class="w-6 h-6 border border-brand-olive/20 text-brand-olive/60 hover:border-brand-primary hover:text-brand-primary transition-colors flex items-center justify-center text-sm"
                          >-</button>
                          <span class="font-sans text-sm text-brand-olive w-8 text-center">{{ item.quantity }}</span>
                          <button
                            @click="incrementQty(idx)"
                            class="w-6 h-6 border border-brand-olive/20 text-brand-olive/60 hover:border-brand-primary hover:text-brand-primary transition-colors flex items-center justify-center text-sm"
                          >+</button>
                        </div>
                      </template>
                      <span v-else class="font-sans text-sm text-brand-olive">{{ item.quantity }}</span>
                    </td>
                    <td class="py-2 px-2 text-right">
                      <template v-if="editMode">
                        <input
                          v-model.number="item.price"
                          type="number"
                          min="0"
                          class="w-24 px-2 py-1 border border-brand-olive/20 bg-white font-sans text-sm text-brand-olive text-right focus:outline-none focus:border-brand-primary transition-colors"
                        />
                      </template>
                      <span v-else class="font-sans text-sm text-brand-olive/70">{{ formatPrice(item.price) }}</span>
                    </td>
                    <td class="py-2 pl-2 text-right">
                      <span class="font-sans text-sm font-medium text-brand-olive">{{ formatPrice(item.quantity * item.price) }}</span>
                    </td>
                    <td v-if="editMode" class="py-2 pl-2">
                      <button
                        @click="removeItem(idx)"
                        class="text-red-500 hover:text-red-700 transition-colors"
                        title="Quitar"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="square" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- Add product (edit mode) -->
              <div v-if="editMode" class="mb-4">
                <div v-if="!showProductSearch" class="text-center">
                  <button
                    @click="showProductSearch = true"
                    class="font-sans text-sm text-brand-primary hover:underline"
                  >
                    + Agregar producto
                  </button>
                </div>
                <div v-else class="border-2 border-brand-olive/10 p-3">
                  <input
                    v-model="productSearchQuery"
                    type="text"
                    placeholder="Buscar producto por nombre..."
                    class="w-full px-3 py-2 border border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors mb-2"
                  />
                  <div v-if="filteredProducts.length > 0" class="max-h-40 overflow-y-auto">
                    <button
                      v-for="product in filteredProducts"
                      :key="product.id"
                      @click="addProduct(product)"
                      class="w-full text-left px-3 py-2 font-sans text-sm text-brand-olive hover:bg-brand-cream transition-colors"
                    >
                      {{ product.name }} - {{ formatPrice(product.price) }}
                    </button>
                  </div>
                  <p v-else-if="productSearchQuery.length > 0" class="font-sans text-xs text-brand-olive/50 px-3 py-2">
                    No se encontraron productos.
                  </p>
                  <button
                    @click="showProductSearch = false; productSearchQuery = ''"
                    class="mt-2 font-sans text-xs text-brand-olive/50 hover:text-brand-primary"
                  >
                    Cancelar
                  </button>
                </div>
              </div>

              <!-- Totals -->
              <div class="border-t-2 border-brand-olive/10 pt-4 space-y-2">
                <div class="flex justify-between">
                  <span class="font-sans text-sm text-brand-olive/60">Subtotal productos</span>
                  <span class="font-sans text-sm text-brand-olive/60">{{ formatPrice(editableSubtotal) }}</span>
                </div>
                <div v-if="editablePromoDiscount > 0" class="flex justify-between">
                  <span class="font-sans text-sm text-brand-primary">
                    {{ order.promoCode?.discountPercent }}% codigo {{ order.promoCode?.code }}
                  </span>
                  <span class="font-sans text-sm text-brand-primary">-{{ formatPrice(editablePromoDiscount) }}</span>
                </div>
                <div v-if="editablePaymentDiscount > 0" class="flex justify-between">
                  <span class="font-sans text-sm text-brand-primary">10% descuento (transferencia/efectivo)</span>
                  <span class="font-sans text-sm text-brand-primary">-{{ formatPrice(editablePaymentDiscount) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-sans text-sm font-semibold text-brand-olive">Total</span>
                  <span class="font-sans text-sm font-semibold text-brand-primary">{{ formatPrice(editableTotal) }}</span>
                </div>
              </div>

              <!-- Save changes button -->
              <div v-if="editMode" class="mt-4 pt-4 border-t border-brand-olive/10">
                <button
                  @click="saveItemChanges"
                  :disabled="savingItems"
                  class="px-6 py-2 bg-brand-primary text-brand-cream font-sans text-sm font-medium hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
                >
                  {{ savingItems ? 'Guardando...' : 'GUARDAR CAMBIOS' }}
                </button>
                <span v-if="itemsSaved" class="ml-3 font-sans text-sm text-green-600">Cambios guardados</span>
              </div>
            </div>
          </div>

          <!-- Right column: Status + Notes + Danger -->
          <div class="space-y-6">
            <!-- Status Section -->
            <div class="bg-white border-2 border-brand-olive/10 p-6">
              <h3 class="font-sans text-xs uppercase tracking-wide text-brand-olive/60 mb-4">Estado del pedido</h3>
              <AdminOrderStatusSelect
                :current-status="order.status"
                :order-id="order.id"
                size="lg"
                @updated="onStatusUpdated"
              />
            </div>

            <!-- Notes Section -->
            <div class="bg-white border-2 border-brand-olive/10 p-6">
              <h3 class="font-sans text-xs uppercase tracking-wide text-brand-olive/60 mb-4">Notas del pedido</h3>
              <textarea
                v-model="adminNotes"
                rows="5"
                placeholder="Agregar notas internas sobre este pedido..."
                class="w-full px-3 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors resize-vertical"
              />
              <div class="mt-3 flex items-center gap-3">
                <button
                  @click="saveNotes"
                  :disabled="savingNotes"
                  class="px-6 py-2 bg-brand-primary text-brand-cream font-sans text-sm font-medium hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
                >
                  {{ savingNotes ? 'Guardando...' : 'GUARDAR NOTAS' }}
                </button>
                <span v-if="notesSaved" class="font-sans text-sm text-green-600">Notas guardadas</span>
                <span v-if="notesError" class="font-sans text-sm text-red-500">Error al guardar. Intentá de nuevo.</span>
              </div>
              <p v-if="notesLastSaved" class="mt-2 font-sans text-xs text-brand-olive/40">
                Última actualización: {{ formatDate(notesLastSaved) }}
              </p>
            </div>

            <!-- Danger Zone -->
            <div class="bg-white border-2 border-red-200 p-6">
              <h3 class="font-sans text-xs uppercase tracking-wide text-red-600 mb-3">Zona de peligro</h3>
              <p class="font-sans text-xs text-brand-olive/50 mb-4">Esta accion es irreversible. El pedido sera eliminado permanentemente.</p>
              <button
                @click="showDeleteModal = true"
                class="px-4 py-2 font-sans text-sm text-red-700 border-2 border-red-300 hover:bg-red-700 hover:text-white transition-colors"
              >
                ELIMINAR PEDIDO
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- Error -->
      <div v-else class="bg-white border-2 border-brand-olive/10 p-12 text-center">
        <p class="font-sans text-brand-olive/60 text-sm">{{ error || 'Pedido no encontrado.' }}</p>
        <NuxtLink to="/pedidos" class="inline-block mt-4 font-sans text-sm text-brand-primary hover:underline">
          Volver a pedidos
        </NuxtLink>
      </div>

      <!-- Delete Modal -->
      <AdminConfirmModal
        :visible="showDeleteModal"
        title="Eliminar pedido"
        :message="`Estas seguro de eliminar el pedido ${order?.orderNumber}? Esta accion no se puede deshacer.`"
        confirm-text="Eliminar"
        @confirm="deleteOrder"
        @cancel="showDeleteModal = false"
      />
    </NuxtLayout>
  </div>
</template>

<script setup>
import { formatPrice } from '~/utils/format'

const route = useRoute()
const router = useRouter()
const { get, put, delete: del } = useApi()

const loading = ref(true)
const error = ref('')
const order = ref(null)
const editMode = ref(false)
const editableItems = ref([])
const showDeleteModal = ref(false)
const adminNotes = ref('')

// Item editing state
const savingItems = ref(false)
const itemsSaved = ref(false)
const showProductSearch = ref(false)
const productSearchQuery = ref('')
const allProducts = ref([])

// Notes state
const savingNotes = ref(false)
const notesSaved = ref(false)
const notesError = ref(false)
const notesLastSaved = ref(null)

const fullAddress = computed(() => {
  if (!order.value?.customer) return ''
  const parts = [
    order.value.customer.address,
    order.value.customer.city,
    order.value.customer.province,
  ].filter(Boolean)
  return parts.join(', ')
})

const editableSubtotal = computed(() => {
  return editableItems.value.reduce((sum, item) => sum + (item.quantity * item.price), 0)
})

const hasPromoCode = computed(() => {
  return order.value?.promoCode && order.value.promoCode.discountPercent
})

const hasPaymentDiscount = computed(() => {
  // For new orders with paymentMethodDiscount field, use that
  if (order.value?.paymentMethodDiscount > 0) return true
  // For old orders without promoCode field, fall back to checking discountAmount
  if (!hasPromoCode.value && order.value?.discountAmount > 0) return true
  return false
})

const editablePromoDiscount = computed(() => {
  if (!hasPromoCode.value) return 0
  return Math.round(editableSubtotal.value * (order.value.promoCode.discountPercent / 100))
})

const afterPromoSubtotal = computed(() => {
  return editableSubtotal.value - editablePromoDiscount.value
})

const editablePaymentDiscount = computed(() => {
  if (!hasPaymentDiscount.value) return 0
  return Math.round(afterPromoSubtotal.value * 0.10)
})

const editableTotal = computed(() => {
  return Math.max(0, afterPromoSubtotal.value - editablePaymentDiscount.value)
})

const filteredProducts = computed(() => {
  if (!productSearchQuery.value.trim()) return []
  const q = productSearchQuery.value.toLowerCase().trim()
  return allProducts.value.filter(p => p.name.toLowerCase().includes(q)).slice(0, 10)
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
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${hours}:${minutes}`
}

function openWhatsApp() {
  const phone = (order.value.customer?.phone || '').replace(/\D/g, '')
  const name = order.value.customer?.name || ''
  const text = encodeURIComponent(`Hola ${name}! Te escribo por tu pedido ${order.value.orderNumber} de El Gran Peon. `)
  window.open(`https://wa.me/54${phone}?text=${text}`, '_blank')
}

function initEditableItems() {
  editableItems.value = (order.value?.items || []).map(item => ({
    ...item,
    name: item.name || item.productName || 'Producto',
    category: item.category || item.categoryName || '',
    price: item.price || item.unitPrice || 0,
    quantity: item.quantity || 1,
  }))
}

function incrementQty(idx) {
  editableItems.value[idx].quantity++
}

function decrementQty(idx) {
  if (editableItems.value[idx].quantity > 1) {
    editableItems.value[idx].quantity--
  }
}

function removeItem(idx) {
  editableItems.value.splice(idx, 1)
}

function addProduct(product) {
  editableItems.value.push({
    productId: product.id,
    name: product.name,
    price: product.price,
    quantity: 1,
    category: product.category?.name || '',
    image: product.images?.[0]?.url || '',
  })
  showProductSearch.value = false
  productSearchQuery.value = ''
}

async function saveItemChanges() {
  savingItems.value = true
  itemsSaved.value = false
  try {
    const items = editableItems.value.map(item => ({
      ...item,
      subtotal: item.quantity * item.price,
    }))
    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
    const totalAmount = items.reduce((sum, i) => sum + i.subtotal, 0)
    const totalDiscount = editablePromoDiscount.value + editablePaymentDiscount.value
    const adjustedAmount = totalAmount - totalDiscount

    const updated = await put(`/api/orders/${order.value.id}`, {
      items,
      totalItems,
      totalAmount,
      paymentMethodDiscount: editablePaymentDiscount.value,
      discountAmount: totalDiscount,
      adjustedAmount,
    })
    order.value = updated
    initEditableItems()
    itemsSaved.value = true
    setTimeout(() => { itemsSaved.value = false }, 3000)
  } catch (err) {
    console.error('Error saving items:', err)
  } finally {
    savingItems.value = false
  }
}

async function saveNotes() {
  savingNotes.value = true
  notesSaved.value = false
  notesError.value = false
  try {
    const updated = await put(`/api/orders/${order.value.id}`, {
      adminNotes: adminNotes.value,
    })
    order.value = updated
    notesLastSaved.value = new Date()
    notesSaved.value = true
    setTimeout(() => { notesSaved.value = false }, 3000)
  } catch (err) {
    console.error('Error saving notes:', err)
    notesError.value = true
    setTimeout(() => { notesError.value = false }, 5000)
  } finally {
    savingNotes.value = false
  }
}

function onStatusUpdated(updated) {
  order.value.status = updated.status
}

async function deleteOrder() {
  showDeleteModal.value = false
  try {
    await del(`/api/orders/${order.value.id}`)
    router.push('/pedidos')
  } catch (err) {
    console.error('Error deleting order:', err)
  }
}

onMounted(async () => {
  try {
    const [orderData, products] = await Promise.all([
      get(`/api/orders/${route.params.id}`),
      get('/api/products/all').catch(() => []),
    ])
    order.value = orderData
    allProducts.value = products
    adminNotes.value = orderData.adminNotes || ''
    if (orderData.adminNotes) {
      notesLastSaved.value = new Date(toTimestamp(orderData.updatedAt))
    }
    initEditableItems()
  } catch (err) {
    error.value = 'Error al cargar el pedido.'
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>
