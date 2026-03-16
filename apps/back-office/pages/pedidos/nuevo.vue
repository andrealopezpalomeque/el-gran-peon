<template>
  <div>
    <NuxtLayout name="admin">
      <!-- Header -->
      <div class="flex items-center gap-3 mb-6">
        <NuxtLink to="/pedidos" class="text-brand-olive/50 hover:text-brand-primary transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="square" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </NuxtLink>
        <h2 class="font-display text-brand-primary text-2xl">NUEVA VENTA</h2>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left: Products + Customer -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Products Section -->
          <div class="bg-white border-2 border-brand-olive/10 p-6">
            <h3 class="font-sans text-xs uppercase tracking-wide text-brand-olive/60 mb-4">Productos</h3>

            <!-- Product search -->
            <div class="mb-4">
              <input
                v-model="productSearch"
                type="text"
                placeholder="Buscar producto por nombre..."
                class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
              />
              <div v-if="filteredProducts.length > 0 && productSearch.trim()" class="border-2 border-brand-olive/10 border-t-0 max-h-48 overflow-y-auto">
                <button
                  v-for="product in filteredProducts"
                  :key="product.id"
                  @click="addProduct(product)"
                  class="w-full text-left px-4 py-2.5 font-sans text-sm text-brand-olive hover:bg-brand-cream transition-colors flex items-center justify-between"
                >
                  <span>{{ product.name }}</span>
                  <span class="text-brand-olive/50">{{ formatPrice(product.price) }} · Stock: {{ product.stock === -1 ? '∞' : product.stock }}</span>
                </button>
              </div>
              <p v-else-if="productSearch.trim() && filteredProducts.length === 0" class="font-sans text-xs text-brand-olive/40 mt-1 px-1">
                No se encontraron productos.
              </p>
            </div>

            <!-- Selected items -->
            <div v-if="items.length > 0">
              <table class="w-full mb-4">
                <thead>
                  <tr class="border-b border-brand-olive/10">
                    <th class="text-left font-sans text-xs text-brand-olive/50 pb-2 pr-3">Producto</th>
                    <th class="text-center font-sans text-xs text-brand-olive/50 pb-2 px-2">Cant.</th>
                    <th class="text-right font-sans text-xs text-brand-olive/50 pb-2 px-2">P. Unit.</th>
                    <th class="text-right font-sans text-xs text-brand-olive/50 pb-2 pl-2">Subtotal</th>
                    <th class="pb-2 w-8" />
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, idx) in items" :key="idx" class="border-b border-brand-olive/5">
                    <td class="py-2 pr-3">
                      <p class="font-sans text-sm text-brand-olive">{{ item.name }}</p>
                      <p v-if="item.sku" class="font-sans text-xs text-brand-olive/40">{{ item.sku }}</p>
                    </td>
                    <td class="py-2 px-2 text-center">
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
                    </td>
                    <td class="py-2 px-2 text-right">
                      <input
                        v-model.number="item.price"
                        type="number"
                        min="0"
                        class="w-24 px-2 py-1 border border-brand-olive/20 bg-white font-sans text-sm text-brand-olive text-right focus:outline-none focus:border-brand-primary transition-colors"
                      />
                    </td>
                    <td class="py-2 pl-2 text-right">
                      <span class="font-sans text-sm font-medium text-brand-olive">{{ formatPrice(item.quantity * item.price) }}</span>
                    </td>
                    <td class="py-2 pl-2">
                      <button @click="removeItem(idx)" class="text-red-500 hover:text-red-700 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="square" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- Totals -->
              <div class="border-t-2 border-brand-olive/10 pt-4 space-y-2">
                <div class="flex justify-between">
                  <span class="font-sans text-sm text-brand-olive/60">Subtotal</span>
                  <span class="font-sans text-sm text-brand-olive/60">{{ formatPrice(subtotal) }}</span>
                </div>
                <div v-if="paymentDiscount > 0" class="flex justify-between">
                  <span class="font-sans text-sm text-brand-primary">10% descuento ({{ paymentMethod }})</span>
                  <span class="font-sans text-sm text-brand-primary">-{{ formatPrice(paymentDiscount) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-sans text-sm font-semibold text-brand-olive">Total</span>
                  <span class="font-sans text-sm font-semibold text-brand-primary">{{ formatPrice(total) }}</span>
                </div>
              </div>
            </div>

            <div v-else class="py-8 text-center">
              <p class="font-sans text-sm text-brand-olive/30">Agrega productos al pedido</p>
            </div>
          </div>

          <!-- Customer Section -->
          <div class="bg-white border-2 border-brand-olive/10 p-6">
            <h3 class="font-sans text-xs uppercase tracking-wide text-brand-olive/60 mb-4">Datos del cliente</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="font-sans text-xs text-brand-olive/60 mb-1 block">Nombre *</label>
                <input
                  v-model="customer.name"
                  type="text"
                  class="w-full px-3 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
                />
              </div>
              <div>
                <label class="font-sans text-xs text-brand-olive/60 mb-1 block">Telefono *</label>
                <input
                  v-model="customer.phone"
                  type="text"
                  placeholder="3794007759"
                  class="w-full px-3 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
                />
              </div>
              <div>
                <label class="font-sans text-xs text-brand-olive/60 mb-1 block">Email</label>
                <input
                  v-model="customer.email"
                  type="email"
                  class="w-full px-3 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
                />
              </div>
              <div>
                <label class="font-sans text-xs text-brand-olive/60 mb-1 block">DNI</label>
                <input
                  v-model="customer.dni"
                  type="text"
                  placeholder="12345678"
                  class="w-full px-3 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
                />
              </div>
              <div>
                <label class="font-sans text-xs text-brand-olive/60 mb-1 block">Ciudad</label>
                <input
                  v-model="customer.city"
                  type="text"
                  class="w-full px-3 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
                />
              </div>
              <div class="sm:col-span-2">
                <label class="font-sans text-xs text-brand-olive/60 mb-1 block">Direccion</label>
                <input
                  v-model="customer.address"
                  type="text"
                  class="w-full px-3 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
                />
              </div>
              <div>
                <label class="font-sans text-xs text-brand-olive/60 mb-1 block">Provincia</label>
                <input
                  v-model="customer.province"
                  type="text"
                  class="w-full px-3 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
                />
              </div>
              <div>
                <label class="font-sans text-xs text-brand-olive/60 mb-1 block">Codigo postal</label>
                <input
                  v-model="customer.zipCode"
                  type="text"
                  placeholder="3400"
                  class="w-full px-3 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
                />
              </div>
              <div>
                <label class="font-sans text-xs text-brand-olive/60 mb-1 block">Notas</label>
                <input
                  v-model="customer.notes"
                  type="text"
                  class="w-full px-3 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Payment + Submit -->
        <div class="space-y-6">
          <!-- Payment method -->
          <div class="bg-white border-2 border-brand-olive/10 p-6">
            <h3 class="font-sans text-xs uppercase tracking-wide text-brand-olive/60 mb-4">Metodo de pago</h3>
            <div class="space-y-2">
              <label
                v-for="method in paymentMethods"
                :key="method.value"
                class="flex items-center gap-3 p-3 border-2 cursor-pointer transition-colors"
                :class="paymentMethod === method.value ? 'border-brand-primary bg-brand-primary/5' : 'border-brand-olive/10 hover:border-brand-olive/20'"
              >
                <input
                  v-model="paymentMethod"
                  type="radio"
                  :value="method.value"
                  class="accent-brand-primary"
                />
                <div>
                  <span class="font-sans text-sm text-brand-olive">{{ method.label }}</span>
                  <p v-if="method.discount" class="font-sans text-xs text-brand-primary">10% descuento</p>
                </div>
              </label>
            </div>
          </div>

          <!-- Order notes -->
          <div class="bg-white border-2 border-brand-olive/10 p-6">
            <h3 class="font-sans text-xs uppercase tracking-wide text-brand-olive/60 mb-4">Notas internas</h3>
            <textarea
              v-model="adminNotes"
              rows="3"
              placeholder="Notas sobre este pedido..."
              class="w-full px-3 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors resize-vertical"
            />
          </div>

          <!-- Submit -->
          <div class="bg-white border-2 border-brand-olive/10 p-6">
            <div class="space-y-3 mb-4">
              <div class="flex justify-between">
                <span class="font-sans text-sm text-brand-olive/60">Productos</span>
                <span class="font-sans text-sm text-brand-olive">{{ totalItems }}</span>
              </div>
              <div class="flex justify-between">
                <span class="font-sans text-sm font-semibold text-brand-olive">Total</span>
                <span class="font-sans text-sm font-semibold text-brand-primary">{{ formatPrice(total) }}</span>
              </div>
            </div>

            <p v-if="formError" class="font-sans text-xs text-red-600 mb-3">{{ formError }}</p>

            <button
              @click="submitOrder"
              :disabled="saving"
              class="w-full py-3 bg-brand-primary text-brand-cream font-sans text-sm font-medium hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
            >
              {{ saving ? 'Guardando...' : 'CREAR PEDIDO' }}
            </button>

            <p class="font-sans text-xs text-brand-olive/40 mt-3 text-center">
              Este pedido se registrara como venta manual (back-office)
            </p>
          </div>
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup>
import { formatPrice } from '~/utils/format'

const router = useRouter()
const { get, post } = useApi()

const allProducts = ref([])
const productSearch = ref('')
const items = ref([])
const saving = ref(false)
const formError = ref('')
const adminNotes = ref('')
const paymentMethod = ref('')

const customer = ref({
  name: '',
  phone: '',
  email: '',
  dni: '',
  address: '',
  city: '',
  province: '',
  zipCode: '',
  notes: '',
})

const paymentMethods = [
  { value: 'Transferencia', label: 'Transferencia', discount: true },
  { value: 'Efectivo', label: 'Efectivo', discount: true },
  { value: 'Tarjeta de credito', label: 'Tarjeta de credito', discount: false },
  { value: 'Tarjeta de debito', label: 'Tarjeta de debito', discount: false },
]

const filteredProducts = computed(() => {
  if (!productSearch.value.trim()) return []
  const q = productSearch.value.toLowerCase().trim()
  return allProducts.value.filter(p => p.name.toLowerCase().includes(q)).slice(0, 10)
})

const subtotal = computed(() => items.value.reduce((sum, i) => sum + (i.quantity * i.price), 0))
const totalItems = computed(() => items.value.reduce((sum, i) => sum + i.quantity, 0))

const hasPaymentDiscount = computed(() => {
  return paymentMethod.value === 'Transferencia' || paymentMethod.value === 'Efectivo'
})

const paymentDiscount = computed(() => {
  if (!hasPaymentDiscount.value) return 0
  return Math.round(subtotal.value * 0.10)
})

const total = computed(() => Math.max(0, subtotal.value - paymentDiscount.value))

function addProduct(product) {
  const existing = items.value.find(i => i.productId === product.id)
  if (existing) {
    existing.quantity++
  } else {
    items.value.push({
      productId: product.id,
      name: product.name,
      sku: product.sku || '',
      price: product.price,
      quantity: 1,
      category: product.category?.name || '',
      image: product.images?.[0]?.url || '',
    })
  }
  productSearch.value = ''
}

function incrementQty(idx) {
  items.value[idx].quantity++
}

function decrementQty(idx) {
  if (items.value[idx].quantity > 1) {
    items.value[idx].quantity--
  }
}

function removeItem(idx) {
  items.value.splice(idx, 1)
}

async function submitOrder() {
  formError.value = ''

  if (items.value.length === 0) {
    formError.value = 'Agrega al menos un producto.'
    return
  }
  if (!customer.value.name.trim()) {
    formError.value = 'El nombre del cliente es requerido.'
    return
  }
  if (!customer.value.phone.trim()) {
    formError.value = 'El telefono del cliente es requerido.'
    return
  }

  saving.value = true
  try {
    const orderItems = items.value.map(i => ({
      productId: i.productId,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      category: i.category,
      image: i.image,
      subtotal: i.quantity * i.price,
    }))

    const data = {
      customer: customer.value,
      items: orderItems,
      source: 'backoffice',
      paymentMethod: paymentMethod.value,
      paymentMethodDiscount: paymentDiscount.value,
      discountAmount: paymentDiscount.value,
      adjustedAmount: total.value,
    }

    const created = await post('/api/orders', data)
    router.push(`/pedidos/${created.id}`)
  } catch (err) {
    console.error('Error creating order:', err)
    formError.value = 'Error al crear el pedido. Intenta de nuevo.'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    allProducts.value = await get('/api/products/all')
  } catch (err) {
    console.error('Error loading products:', err)
  }
})
</script>
