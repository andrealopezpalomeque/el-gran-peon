<template>
  <div>
    <h2 class="font-display uppercase text-brand-primary text-3xl md:text-4xl text-center mb-2">
      LO QUE DICEN NUESTROS CLIENTES
    </h2>
    <p class="font-serif text-brand-olive/70 text-center mb-10 md:mb-14">
      La experiencia de quienes ya tienen una pieza de El Gran Peón.
    </p>

    <!-- Carousel -->
    <div
      class="relative"
      role="region"
      aria-label="Opiniones de clientes"
      @mouseenter="paused = true"
      @mouseleave="paused = false"
    >
      <!-- Left arrow (desktop) -->
      <button
        v-show="canScrollLeft"
        class="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white border border-brand-olive/20 text-brand-primary hover:bg-brand-primary hover:text-white transition-colors"
        aria-label="Opinión anterior"
        @click="scrollPrev"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="square" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <!-- Scrollable track -->
      <div
        ref="trackEl"
        class="flex gap-4 md:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide md:px-12"
        @scroll="onScroll"
      >
        <article
          v-for="review in reviews"
          :key="review.id"
          class="snap-start shrink-0 w-[85vw] sm:w-[70vw] lg:w-[calc(33.333%-16px)] bg-white border border-brand-olive/10 p-6 flex flex-col"
        >
          <!-- Stars -->
          <div class="flex gap-0.5 mb-4" :aria-label="`${review.rating} de 5 estrellas`">
            <svg
              v-for="star in review.rating"
              :key="star"
              class="w-5 h-5 text-brand-primary"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>

          <!-- Quote -->
          <p class="font-serif text-brand-olive text-base leading-relaxed flex-1">
            "{{ review.text }}"
          </p>

          <!-- Author -->
          <div class="mt-4 pt-4 border-t border-brand-olive/10 flex items-center gap-2.5">
            <!-- Google "G" icon -->
            <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 0 0 0 12c0 1.94.46 3.77 1.28 5.4l3.56-2.77.01-.54z" fill="#FBBC05" />
              <path d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.09 14.97 0 12 0 7.7 0 3.99 2.47 2.18 6.07l3.66 2.84c.87-2.6 3.3-4.16 6.16-4.16z" fill="#EA4335" />
            </svg>
            <p class="font-sans font-medium text-brand-olive text-sm">
              {{ review.customerName }}
            </p>
          </div>
        </article>
      </div>

      <!-- Right arrow (desktop) -->
      <button
        v-show="canScrollRight"
        class="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white border border-brand-olive/20 text-brand-primary hover:bg-brand-primary hover:text-white transition-colors"
        aria-label="Opinión siguiente"
        @click="scrollNext"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="square" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Dot indicators -->
    <div class="flex justify-center gap-3 mt-8">
      <button
        v-for="(review, index) in reviews"
        :key="review.id"
        class="w-2.5 h-2.5 transition-colors duration-200"
        :class="index === activeIndex ? 'bg-brand-primary' : 'bg-brand-olive/20'"
        :aria-label="`Ir a opinión ${index + 1}`"
        @click="goTo(index)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const reviews = ref([
  {
    id: 1,
    customerName: 'Consty',
    rating: 5,
    text: 'Muy bueno el mate y la bombilla que compre! tienen varios modelos y el dueño es muy buena onda.',
  },
  {
    id: 2,
    customerName: 'Dolores',
    rating: 5,
    text: 'El trabajo artesanal es excelente. No solo en calidad sino todo el servicio. Mil gracias!!',
  },
  {
    id: 3,
    customerName: 'Martín',
    rating: 5,
    text: 'Compré una bombilla y un mate para regalo. La presentación impecable y la calidad se nota al instante. Ya estoy por hacer otro pedido.',
  },
  {
    id: 4,
    customerName: 'Ernestina',
    rating: 5,
    text: 'Muy buenos mates. Recomiendo!',
  },
  {
    id: 5,
    customerName: 'Juan Pablo',
    rating: 5,
    text: 'Pedí un kit empresarial para mi equipo de trabajo y fue un éxito. Todos quedaron encantados con la calidad y el detalle de cada pieza.',
  },
])

const trackEl = ref(null)
const activeIndex = ref(0)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)
const paused = ref(false)
let interval = null

const updateState = () => {
  if (!trackEl.value) return
  const cards = trackEl.value.children
  const { scrollLeft, scrollWidth, clientWidth } = trackEl.value

  // Determine which card is closest to the scroll position
  let closest = 0
  let minDist = Infinity
  for (let i = 0; i < cards.length; i++) {
    const dist = Math.abs(cards[i].offsetLeft - scrollLeft)
    if (dist < minDist) {
      minDist = dist
      closest = i
    }
  }
  activeIndex.value = closest

  // Hide left arrow at first card, right arrow at last visible position
  canScrollLeft.value = closest > 0
  canScrollRight.value = scrollLeft + clientWidth < scrollWidth - 2
}

const onScroll = () => {
  updateState()
}

const scrollToIndex = (index) => {
  if (!trackEl.value) return
  const cards = trackEl.value.children
  if (cards[index]) {
    trackEl.value.scrollTo({
      left: cards[index].offsetLeft - trackEl.value.offsetLeft,
      behavior: 'smooth',
    })
  }
}

const scrollPrev = () => {
  if (!trackEl.value) return
  trackEl.value.scrollBy({ left: -trackEl.value.clientWidth * 0.75, behavior: 'smooth' })
}

const scrollNext = () => {
  if (!trackEl.value) return
  trackEl.value.scrollBy({ left: trackEl.value.clientWidth * 0.75, behavior: 'smooth' })
}

const goTo = (index) => {
  scrollToIndex(index)
  resetTimer()
}

const advance = () => {
  if (paused.value) return
  const nextIndex = (activeIndex.value + 1) % reviews.value.length
  scrollToIndex(nextIndex)
}

const resetTimer = () => {
  if (interval) clearInterval(interval)
  interval = setInterval(advance, 8000)
}

onMounted(() => {
  updateState()
  resetTimer()
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
