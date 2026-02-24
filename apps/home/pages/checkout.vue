<template>
  <div class="container mx-auto px-4 md:px-6 pt-4 pb-10 md:pt-6 md:pb-16">
    <!-- Breadcrumb -->
    <UiBreadcrumb :items="[
      { label: 'Inicio', to: '/' },
      { label: 'Carrito', to: '/carrito' },
      { label: 'Checkout', to: null },
    ]" class="mb-6" />

    <h1 class="font-display text-brand-primary text-2xl md:text-3xl">CHECKOUT</h1>

    <!-- Empty cart redirect -->
    <div v-if="cart.items.length === 0" class="mt-12 text-center">
      <p class="font-serif text-brand-olive/60 text-lg">Tu carrito esta vacio</p>
      <NuxtLink
        to="/productos"
        class="inline-block mt-6 font-sans text-sm text-brand-primary underline underline-offset-4 hover:text-brand-primary/80 transition-colors duration-200"
      >
        Ver productos
      </NuxtLink>
    </div>

    <div v-else class="mt-8 lg:flex lg:gap-12">
      <!-- Left: Form -->
      <div class="lg:flex-1">
        <form @submit.prevent="submitOrder" novalidate>

          <!-- Informacion de Contacto -->
          <fieldset class="mb-10">
            <legend class="font-display text-brand-primary text-lg mb-6">INFORMACION DE CONTACTO</legend>

            <div class="space-y-4">
              <div>
                <label for="name" class="block font-sans text-sm text-brand-olive mb-1">Nombre completo *</label>
                <input
                  id="name"
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full px-4 py-3 border font-sans text-sm text-brand-olive bg-white focus:outline-none focus:border-brand-primary transition-colors"
                  :class="errors.name ? 'border-red-500' : 'border-brand-olive/20'"
                  placeholder="Juan Perez"
                />
                <p v-if="errors.name" class="font-sans text-xs text-red-500 mt-1">{{ errors.name }}</p>
              </div>

              <div>
                <label for="phone" class="block font-sans text-sm text-brand-olive mb-1">Telefono *</label>
                <div class="flex">
                  <span class="px-4 py-3 border border-r-0 border-brand-olive/20 bg-brand-olive/5 font-sans text-sm text-brand-olive/60">+54</span>
                  <input
                    id="phone"
                    v-model="form.phone"
                    type="tel"
                    required
                    class="flex-1 px-4 py-3 border font-sans text-sm text-brand-olive bg-white focus:outline-none focus:border-brand-primary transition-colors"
                    :class="errors.phone ? 'border-red-500' : 'border-brand-olive/20'"
                    placeholder="11 1234 5678"
                  />
                </div>
                <p v-if="errors.phone" class="font-sans text-xs text-red-500 mt-1">{{ errors.phone }}</p>
              </div>

              <div>
                <label for="email" class="block font-sans text-sm text-brand-olive mb-1">Email *</label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  required
                  class="w-full px-4 py-3 border font-sans text-sm text-brand-olive bg-white focus:outline-none focus:border-brand-primary transition-colors"
                  :class="errors.email ? 'border-red-500' : 'border-brand-olive/20'"
                  placeholder="juan@email.com"
                />
                <p v-if="errors.email" class="font-sans text-xs text-red-500 mt-1">{{ errors.email }}</p>
              </div>
            </div>
          </fieldset>

          <!-- Direccion de Envio -->
          <fieldset class="mb-10">
            <legend class="font-display text-brand-primary text-lg mb-6">DIRECCION DE ENVIO</legend>

            <div class="space-y-4">
              <div>
                <label for="address" class="block font-sans text-sm text-brand-olive mb-1">Direccion *</label>
                <input
                  id="address"
                  v-model="form.address"
                  type="text"
                  required
                  class="w-full px-4 py-3 border font-sans text-sm text-brand-olive bg-white focus:outline-none focus:border-brand-primary transition-colors"
                  :class="errors.address ? 'border-red-500' : 'border-brand-olive/20'"
                  placeholder="Av. Corrientes 1234, Piso 3"
                />
                <p v-if="errors.address" class="font-sans text-xs text-red-500 mt-1">{{ errors.address }}</p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="city" class="block font-sans text-sm text-brand-olive mb-1">Ciudad *</label>
                  <input
                    id="city"
                    v-model="form.city"
                    type="text"
                    required
                    class="w-full px-4 py-3 border font-sans text-sm text-brand-olive bg-white focus:outline-none focus:border-brand-primary transition-colors"
                    :class="errors.city ? 'border-red-500' : 'border-brand-olive/20'"
                    placeholder="Corrientes"
                  />
                  <p v-if="errors.city" class="font-sans text-xs text-red-500 mt-1">{{ errors.city }}</p>
                </div>

                <div>
                  <label for="province" class="block font-sans text-sm text-brand-olive mb-1">Provincia *</label>
                  <select
                    id="province"
                    v-model="form.province"
                    required
                    class="w-full px-4 py-3 border font-sans text-sm text-brand-olive bg-white focus:outline-none focus:border-brand-primary transition-colors appearance-none"
                    :class="errors.province ? 'border-red-500' : 'border-brand-olive/20'"
                  >
                    <option value="" disabled>Seleccionar provincia</option>
                    <option v-for="prov in provinces" :key="prov" :value="prov">{{ prov }}</option>
                  </select>
                  <p v-if="errors.province" class="font-sans text-xs text-red-500 mt-1">{{ errors.province }}</p>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="zipCode" class="block font-sans text-sm text-brand-olive mb-1">Codigo postal</label>
                  <input
                    id="zipCode"
                    v-model="form.zipCode"
                    type="text"
                    class="w-full px-4 py-3 border border-brand-olive/20 font-sans text-sm text-brand-olive bg-white focus:outline-none focus:border-brand-primary transition-colors"
                    placeholder="3400"
                  />
                </div>
              </div>

              <div>
                <label for="notes" class="block font-sans text-sm text-brand-olive mb-1">Notas adicionales</label>
                <textarea
                  id="notes"
                  v-model="form.notes"
                  rows="3"
                  class="w-full px-4 py-3 border border-brand-olive/20 font-sans text-sm text-brand-olive bg-white focus:outline-none focus:border-brand-primary transition-colors resize-none"
                  placeholder="Indicaciones para la entrega, horarios, etc."
                ></textarea>
              </div>
            </div>
          </fieldset>

          <!-- Metodo de Pago -->
          <fieldset class="mb-10">
            <legend class="font-display text-brand-primary text-lg mb-6">METODO DE PAGO</legend>

            <div class="space-y-3">
              <label
                v-for="method in paymentMethods"
                :key="method.value"
                class="flex items-center gap-3 p-4 border cursor-pointer transition-colors"
                :class="form.paymentMethod === method.value ? 'border-brand-primary bg-brand-primary/5' : 'border-brand-olive/20 hover:border-brand-olive/40'"
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  :value="method.value"
                  v-model="form.paymentMethod"
                  class="accent-brand-primary"
                />
                <span class="font-sans text-sm text-brand-olive">{{ method.label }}</span>
                <span v-if="method.discount" class="ml-auto font-sans text-xs font-medium text-brand-primary">10% OFF</span>
              </label>
            </div>
            <p v-if="errors.paymentMethod" class="font-sans text-xs text-red-500 mt-2">{{ errors.paymentMethod }}</p>
          </fieldset>

          <!-- Codigo Promocional -->
          <fieldset class="mb-10">
            <legend class="font-display text-brand-primary text-lg mb-6">CODIGO PROMOCIONAL</legend>

            <div v-if="!appliedPromo" class="flex gap-3">
              <input
                v-model="promoInput"
                type="text"
                class="flex-1 px-4 py-3 border border-brand-olive/20 font-sans text-sm text-brand-olive bg-white uppercase focus:outline-none focus:border-brand-primary transition-colors"
                placeholder="Ingresa tu codigo"
                @keyup.enter="applyPromoCode"
              />
              <button
                type="button"
                @click="applyPromoCode"
                :disabled="validatingPromo || !promoInput.trim()"
                class="px-6 py-3 bg-brand-primary text-brand-cream font-sans text-sm font-medium hover:bg-brand-primary/90 transition-colors disabled:bg-brand-olive/20 disabled:text-brand-olive/40"
              >
                {{ validatingPromo ? 'VALIDANDO...' : 'APLICAR' }}
              </button>
            </div>

            <div v-else class="flex items-center justify-between p-4 border border-brand-primary bg-brand-primary/5">
              <div>
                <span class="font-sans text-sm font-semibold text-brand-primary">{{ appliedPromo.code }}</span>
                <span class="font-sans text-sm text-brand-olive ml-2">{{ appliedPromo.discountPercent }}% de descuento</span>
              </div>
              <button
                type="button"
                @click="removePromoCode"
                class="font-sans text-sm text-brand-olive/60 underline underline-offset-2 hover:text-brand-primary transition-colors"
              >
                Quitar
              </button>
            </div>

            <p v-if="promoError" class="font-sans text-xs text-red-500 mt-2">{{ promoError }}</p>
          </fieldset>

          <!-- Submit -->
          <div class="lg:hidden mb-10">
            <OrderSummary
              :items="cart.items"
              :subtotal="cart.subtotal"
              :promo-discount="promoDiscountInfo"
              :payment-discount-amount="paymentDiscountAmount"
              :total="orderTotal"
            />
          </div>

          <button
            type="submit"
            :disabled="submitting"
            class="w-full py-4 bg-brand-primary text-brand-cream font-sans font-medium text-sm tracking-wide hover:bg-brand-primary/90 transition-colors duration-200 disabled:bg-brand-olive/20 disabled:text-brand-olive/40"
          >
            {{ submitting ? 'ENVIANDO PEDIDO...' : 'ENVIAR PEDIDO' }}
          </button>

          <p class="font-sans text-xs text-brand-olive/50 mt-3 text-center">
            Te contactaremos por WhatsApp para confirmar precio y coordinar entrega
          </p>

          <p v-if="submitError" class="font-sans text-sm text-red-500 mt-4 text-center">
            {{ submitError }}
          </p>
        </form>
      </div>

      <!-- Right: Order Summary (desktop) -->
      <div class="hidden lg:block lg:w-96">
        <div class="sticky top-44">
          <OrderSummary
            :items="cart.items"
            :subtotal="cart.subtotal"
            :promo-discount="promoDiscountInfo"
            :payment-discount-amount="paymentDiscountAmount"
            :total="orderTotal"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick } from 'vue'
import { formatPrice } from '~/utils/format'

const cart = useCartStore()
const { post } = useApi()
const router = useRouter()

const submitting = ref(false)
const submitError = ref('')

const form = reactive({
  name: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  province: '',
  zipCode: '',
  notes: '',
  paymentMethod: 'transferencia',
})

const errors = reactive({
  name: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  province: '',
  paymentMethod: '',
})

const provinces = [
  'Buenos Aires',
  'CABA',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Cordoba',
  'Corrientes',
  'Entre Rios',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquen',
  'Rio Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucuman',
]

const PAYMENT_DISCOUNT_RATE = 0.10

const paymentMethods = [
  { value: 'transferencia', label: 'Transferencia bancaria', discount: true },
  { value: 'efectivo', label: 'Efectivo contra entrega (disponible en Corrientes Capital)', discount: true },
  { value: 'tarjeta', label: 'Tarjeta de credito (hasta 3 cuotas)', discount: false },
]

// Promo code state
const promoInput = ref('')
const promoError = ref('')
const validatingPromo = ref(false)
const appliedPromo = ref(null)

// Promo discount: applied first on subtotal
const promoDiscountAmount = computed(() => {
  if (!appliedPromo.value) return 0
  return Math.round(cart.subtotal * (appliedPromo.value.discountPercent / 100))
})

const promoDiscountInfo = computed(() => {
  if (!appliedPromo.value) return null
  return {
    code: appliedPromo.value.code,
    discountPercent: appliedPromo.value.discountPercent,
    amount: promoDiscountAmount.value,
  }
})

// Payment method discount: applied on remainder after promo
const hasPaymentDiscount = computed(() => {
  const method = paymentMethods.find(m => m.value === form.paymentMethod)
  return method?.discount ?? false
})

const afterPromoSubtotal = computed(() => {
  return cart.subtotal - promoDiscountAmount.value
})

const paymentDiscountAmount = computed(() => {
  return hasPaymentDiscount.value ? Math.round(afterPromoSubtotal.value * PAYMENT_DISCOUNT_RATE) : 0
})

const orderTotal = computed(() => {
  return Math.max(0, afterPromoSubtotal.value - paymentDiscountAmount.value)
})

async function applyPromoCode() {
  if (!promoInput.value.trim()) return

  validatingPromo.value = true
  promoError.value = ''

  try {
    const result = await post('/api/promocodes/validate', {
      code: promoInput.value.trim(),
      email: form.email || '',
    })

    if (result.valid) {
      appliedPromo.value = {
        code: result.code,
        discountPercent: result.discountPercent,
        promoCodeId: result.promoCodeId,
      }
      promoInput.value = ''
    } else {
      promoError.value = result.error || 'Codigo invalido'
    }
  } catch (err) {
    promoError.value = 'Error al validar el codigo. Intenta de nuevo.'
  } finally {
    validatingPromo.value = false
  }
}

function removePromoCode() {
  appliedPromo.value = null
  promoError.value = ''
}

const paymentMethodLabels = {
  transferencia: 'Transferencia bancaria',
  efectivo: 'Efectivo contra entrega (disponible en Corrientes Capital)',
  tarjeta: 'Tarjeta de credito (hasta 3 cuotas)',
}

function validate() {
  let valid = true

  errors.name = ''
  errors.phone = ''
  errors.email = ''
  errors.address = ''
  errors.city = ''
  errors.province = ''
  errors.paymentMethod = ''

  if (!form.name.trim()) {
    errors.name = 'El nombre es obligatorio'
    valid = false
  }

  if (!form.phone.trim()) {
    errors.phone = 'El telefono es obligatorio'
    valid = false
  }

  if (!form.email.trim()) {
    errors.email = 'El email es obligatorio'
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Ingresa un email valido'
    valid = false
  }

  if (!form.address.trim()) {
    errors.address = 'La direccion es obligatoria'
    valid = false
  }

  if (!form.city.trim()) {
    errors.city = 'La ciudad es obligatoria'
    valid = false
  }

  if (!form.province) {
    errors.province = 'Selecciona una provincia'
    valid = false
  }

  if (!form.paymentMethod) {
    errors.paymentMethod = 'Selecciona un metodo de pago'
    valid = false
  }

  return valid
}

function scrollToFirstError() {
  const fieldIds = ['name', 'phone', 'email', 'address', 'city', 'province']
  for (const id of fieldIds) {
    if (errors[id]) {
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.focus({ preventScroll: true })
        return
      }
    }
  }
  if (errors.paymentMethod) {
    const radios = document.querySelector('input[name="paymentMethod"]')
    if (radios) {
      radios.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }
}

async function submitOrder() {
  if (!validate()) {
    nextTick(() => scrollToFirstError())
    return
  }

  submitting.value = true
  submitError.value = ''

  try {
    const totalDiscount = promoDiscountAmount.value + paymentDiscountAmount.value

    const orderData = {
      customer: {
        name: form.name.trim(),
        phone: `+54${form.phone.trim()}`,
        email: form.email.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        province: form.province,
        zipCode: form.zipCode.trim(),
        notes: form.notes.trim(),
      },
      items: cart.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        basePrice: item.basePrice || item.unitPrice,
        unitPrice: item.unitPrice,
        subtotal: item.unitPrice * item.quantity,
        freeShipping: item.freeShipping || false,
        customizations: item.customizations || null,
        customizationsExtra: item.customizationsExtra || 0,
      })),
      totalItems: cart.itemCount,
      totalAmount: cart.subtotal,
      promoCode: appliedPromo.value ? {
        code: appliedPromo.value.code,
        discountPercent: appliedPromo.value.discountPercent,
        promoCodeId: appliedPromo.value.promoCodeId,
      } : null,
      paymentMethodDiscount: paymentDiscountAmount.value,
      discountAmount: totalDiscount,
      adjustedAmount: orderTotal.value,
      paymentMethod: paymentMethodLabels[form.paymentMethod] || form.paymentMethod,
      source: 'storefront',
    }

    await post('/api/orders', orderData)

    const whatsappUrl = cart.generateWhatsAppUrl({
      customer: orderData.customer,
      paymentMethod: orderData.paymentMethod,
      promoCode: appliedPromo.value,
      promoDiscountAmount: promoDiscountAmount.value,
      paymentDiscountAmount: paymentDiscountAmount.value,
      adjustedAmount: orderTotal.value,
    })

    cart.clearCart()

    sessionStorage.setItem('elgranpeon-whatsapp', whatsappUrl)
    await router.push('/pedido-enviado')
  } catch (error) {
    submitError.value = 'Hubo un error al enviar el pedido. Por favor intenta nuevamente.'
    console.error('Order submission error:', error)
  } finally {
    submitting.value = false
  }
}

useHead({
  title: 'Checkout | El Gran Peon',
})
</script>
