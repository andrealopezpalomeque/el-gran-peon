<template>
  <div
    ref="carouselRef"
    class="relative w-full h-[50vh] md:h-[70vh] overflow-hidden touch-pan-y"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd"
  >
    <!-- Slides -->
    <div
      v-for="(slide, index) in slides"
      :key="index"
      class="absolute inset-0 transition-opacity duration-1000 ease-in-out"
      :class="index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'"
    >
      <!-- Background image -->
      <div
        class="absolute inset-0 bg-cover bg-[30%_30%] md:bg-center"
        :style="{ backgroundImage: `url(${slide.image})` }"
      />
      <!-- Overlay -->
      <div class="absolute inset-0 bg-black/40" />
      <!-- Content -->
      <div class="relative z-10 h-full flex items-center">
        <div class="container mx-auto px-6">
          <div class="max-w-2xl">
            <p class="font-sans uppercase tracking-widest text-sm text-brand-cream/80 mb-4">
              {{ slide.tagline }}
            </p>
            <h2 class="font-display uppercase text-brand-cream text-hero-mobile md:text-hero mb-8">
              {{ slide.headline }}
            </h2>
            <a
              v-if="slide.cta && slide.ctaLink.startsWith('#')"
              :href="slide.ctaLink"
              class="inline-block border-2 border-brand-cream text-brand-cream font-sans text-sm uppercase tracking-widest px-8 py-3 hover:bg-brand-cream hover:text-brand-olive transition-colors duration-200"
              @click.prevent="scrollToSection(slide.ctaLink)"
            >
              {{ slide.cta }}
            </a>
            <NuxtLink
              v-else-if="slide.cta"
              :to="slide.ctaLink"
              class="inline-block border-2 border-brand-cream text-brand-cream font-sans text-sm uppercase tracking-widest px-8 py-3 hover:bg-brand-cream hover:text-brand-olive transition-colors duration-200"
            >
              {{ slide.cta }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation arrows (desktop only) -->
    <button
      class="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center text-brand-cream/70 hover:text-brand-cream transition-colors"
      aria-label="Anterior"
      @click="prev"
    >
      <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
        <path stroke-linecap="square" stroke-linejoin="miter" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <button
      class="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center text-brand-cream/70 hover:text-brand-cream transition-colors"
      aria-label="Siguiente"
      @click="next"
    >
      <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
        <path stroke-linecap="square" stroke-linejoin="miter" d="M9 5l7 7-7 7" />
      </svg>
    </button>

    <!-- Dot indicators -->
    <div class="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-3">
      <button
        v-for="(slide, index) in slides"
        :key="index"
        class="w-2.5 h-2.5 transition-colors duration-200"
        :class="index === current ? 'bg-brand-cream' : 'bg-brand-cream/40'"
        :aria-label="`Ir a slide ${index + 1}`"
        @click="goTo(index)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import capsulaRaizHero from '~/assets/images/capsula-raiz-hero.jpg'
import nuestroOrigenHero from '~/assets/images/nuestro-origen-hero.jpg'
import heroImg from '~/assets/images/hero.jpg'

const slides = ref([
  {
    image: capsulaRaizHero,
    tagline: 'CÁPSULA RAÍZ',
    headline: 'EL COMIENZO DE TODO',
    cta: 'VER COLECCIÓN',
    ctaLink: '#capsula-raiz',
  },
  {
    image: nuestroOrigenHero,
    tagline: 'NUESTRO ORIGEN',
    headline: 'CADA PIEZA CUENTA UNA HISTORIA',
    cta: 'CONOCENOS',
    ctaLink: '/nosotros',
  },
  {
    image: heroImg,
    tagline: 'REGALOS CORPORATIVOS',
    headline: 'TU MARCA, NUESTRO OFICIO',
    cta: 'TRABAJEMOS JUNTOS',
    ctaLink: '/empresariales',
  },
  {
    image: heroImg,
    tagline: 'MAYORISTAS',
    headline: 'CALIDAD QUE SE MULTIPLICA',
    cta: 'CONSULTÁ CONDICIONES',
    ctaLink: '/mayoristas',
  },
])

const carouselRef = ref(null)
const current = ref(0)
let interval = null
let touchStartX = 0
let touchStartY = 0

const onTouchStart = (e) => {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
}

const onTouchEnd = (e) => {
  const deltaX = e.changedTouches[0].clientX - touchStartX
  const deltaY = e.changedTouches[0].clientY - touchStartY

  // Only trigger if horizontal swipe is dominant and exceeds threshold
  if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
    if (deltaX < 0) next()
    else prev()
    resetTimer()
  }
}

const scrollToSection = (hash) => {
  const el = document.querySelector(hash)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

const next = () => {
  current.value = (current.value + 1) % slides.value.length
}

const prev = () => {
  current.value = (current.value - 1 + slides.value.length) % slides.value.length
}

const goTo = (index) => {
  current.value = index
  resetTimer()
}

const resetTimer = () => {
  if (interval) clearInterval(interval)
  interval = setInterval(next, 6000)
}

onMounted(() => {
  resetTimer()
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})
</script>
