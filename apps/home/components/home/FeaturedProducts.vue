<template>
  <div v-if="products.length">
    <h2 class="font-display uppercase text-brand-primary text-2xl md:text-3xl text-center mb-2">
      PIEZAS ELEGIDAS PARA VOS
    </h2>
    <p class="font-serif text-brand-olive/70 text-center mb-10 md:mb-14">
      Hechas para durar, como las cosas bien hechas.
    </p>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
        :show-actions="true"
        @quick-buy="handleQuickBuy"
        @add-to-cart="handleAddToCart"
      />
    </div>
    <!-- Toast notification -->
    <Transition name="toast">
      <div
        v-if="toastMessage"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-brand-olive text-brand-cream font-sans text-sm px-6 py-3"
      >
        {{ toastMessage }}
      </div>
    </Transition>
  </div>
  <div v-else-if="loaded" class="text-center py-12">
    <p class="font-display uppercase text-brand-primary text-2xl mb-4">PIEZAS ELEGIDAS PARA VOS</p>
    <p class="font-serif text-brand-olive/60">Próximamente</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCartStore } from '~/stores/cart'

const { get } = useApi()
const cart = useCartStore()
const router = useRouter()

const products = ref([])
const loaded = ref(false)
const toastMessage = ref('')

onMounted(async () => {
  const data = await get('/api/products?featured=true&limit=6')
  if (data && data.length) {
    products.value = data
  }
  loaded.value = true
})

const handleQuickBuy = (product) => {
  cart.addProduct(product, 1)
  router.push('/checkout')
}

let toastTimeout = null
const handleAddToCart = (product) => {
  cart.addProduct(product, 1)
  toastMessage.value = `${product.name} agregado al carrito`
  if (toastTimeout) clearTimeout(toastTimeout)
  toastTimeout = setTimeout(() => {
    toastMessage.value = ''
  }, 2500)
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 1rem);
}
</style>
