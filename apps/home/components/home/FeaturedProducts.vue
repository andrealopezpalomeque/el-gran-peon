<template>
  <div v-if="products.length">
    <h2 class="font-display uppercase text-brand-primary text-2xl md:text-3xl text-center mb-2">
      CÁPSULA RAÍZ · DESTACADOS
    </h2>
    <p class="font-serif text-brand-olive/70 text-center mb-10 md:mb-14">
      El comienzo de todo. Estas son las piezas que elegimos para empezar.
    </p>

    <!-- Carousel -->
    <div class="relative">
      <!-- Left arrow -->
      <button
        v-show="canScrollLeft"
        class="hidden md:flex absolute left-0 top-[35%] -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-brand-cream border border-brand-primary/30 text-brand-primary hover:bg-brand-primary hover:text-brand-cream transition-colors"
        aria-label="Anterior"
        @click="scrollPrev"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="square" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <!-- Scrollable track -->
      <div
        ref="trackEl"
        class="flex gap-4 md:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide"
        @scroll="onScroll"
      >
        <div
          v-for="product in products"
          :key="product.id"
          class="snap-start shrink-0 w-[68vw] sm:w-[44vw] md:w-[calc(25%-18px)]"
        >
          <ProductCard
            :product="product"
            :show-actions="true"
            :compact-actions="true"
            @add-to-cart="handleAddToCart"
          />
        </div>
      </div>

      <!-- Right arrow -->
      <button
        v-show="canScrollRight"
        class="hidden md:flex absolute right-0 top-[35%] -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-brand-cream border border-brand-primary/30 text-brand-primary hover:bg-brand-primary hover:text-brand-cream transition-colors"
        aria-label="Siguiente"
        @click="scrollNext"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="square" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <div class="text-center mt-10 md:mt-14">
      <NuxtLink
        to="/productos"
        class="inline-block border-2 border-brand-primary text-brand-primary font-sans text-sm uppercase tracking-widest px-8 py-3 hover:bg-brand-primary hover:text-brand-cream transition-colors duration-200"
      >
        VER TODOS LOS PRODUCTOS
      </NuxtLink>
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
    <p class="font-display uppercase text-brand-primary text-2xl mb-4">CÁPSULA RAÍZ · DESTACADOS</p>
    <p class="font-serif text-brand-olive/60">Próximamente</p>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useCartStore } from '~/stores/cart'

const { get } = useApi()
const cart = useCartStore()

const products = ref([])
const loaded = ref(false)
const toastMessage = ref('')
const trackEl = ref(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

onMounted(async () => {
  const data = await get('/api/products?featured=true&limit=10')
  if (data && data.length) {
    products.value = data
  }
  loaded.value = true
  await nextTick()
  updateScrollState()
})

const updateScrollState = () => {
  if (!trackEl.value) return
  const { scrollLeft, scrollWidth, clientWidth } = trackEl.value
  canScrollLeft.value = scrollLeft > 2
  canScrollRight.value = scrollLeft + clientWidth < scrollWidth - 2
}

const onScroll = () => {
  updateScrollState()
}

const scrollPrev = () => {
  if (!trackEl.value) return
  trackEl.value.scrollBy({ left: -trackEl.value.clientWidth * 0.75, behavior: 'smooth' })
}

const scrollNext = () => {
  if (!trackEl.value) return
  trackEl.value.scrollBy({ left: trackEl.value.clientWidth * 0.75, behavior: 'smooth' })
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
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
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
