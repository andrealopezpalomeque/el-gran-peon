<template>
  <section class="bg-brand-olive py-16 md:py-24">
    <div class="container mx-auto px-6">
      <div class="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        <!-- Text column -->
        <div class="text-center md:text-left">
          <p class="font-sans text-xs uppercase tracking-widest text-brand-cream/60 mb-4">
            PARA EMPRESAS
          </p>
          <h2 class="font-display uppercase text-brand-cream text-3xl md:text-4xl mb-6">
            PIEZAS QUE REPRESENTAN TU MARCA
          </h2>
          <p class="font-serif text-brand-cream/80 text-base md:text-lg leading-relaxed max-w-lg mx-auto md:mx-0 mb-10">
            Creamos productos pensados para empresas que valoran la identidad y el trabajo bien hecho. Desarrollamos indumentaria, productos térmicos, mates, bombillas, cuchillos, tablas, entre otros, cuidando los materiales, los procesos y el resultado final.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <NuxtLink
              to="/empresariales"
              class="inline-block border-2 border-brand-cream text-brand-cream font-sans text-sm uppercase tracking-widest px-8 py-3 hover:bg-brand-cream hover:text-brand-olive transition-colors duration-200 text-center"
            >
              VER PRODUCTOS
            </NuxtLink>
            <a
              href="https://wa.me/543794007759?text=Hola!%20Quiero%20consultar%20sobre%20regalos%20empresariales%20de%20El%20Gran%20Pe%C3%B3n"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-block bg-brand-cream text-brand-olive font-sans text-sm uppercase tracking-widest px-8 py-3 hover:bg-brand-cream/90 transition-colors duration-200 text-center"
            >
              HABLAR CON UN REPRESENTANTE
            </a>
          </div>
        </div>
        <!-- Image column (desktop) — pending client photo -->
        <div class="hidden md:flex items-center justify-center h-[500px] border border-dashed border-brand-cream/30">
          <p class="font-sans text-sm uppercase tracking-widest text-brand-cream/30">
            Imagen pendiente
          </p>
        </div>
      </div>

      <!-- Trust logos carousel -->
      <div class="mt-16 pt-10 border-t border-brand-cream/20 transition-opacity duration-500" :class="ready ? 'opacity-100' : 'opacity-0'">
        <p class="font-sans text-xs uppercase tracking-widest text-brand-cream/40 text-center mb-8">
          EMPRESAS QUE CONFÍAN EN NUESTRO TRABAJO
        </p>
        <div
          class="logos-carousel overflow-hidden"
          @mouseenter="paused = true"
          @mouseleave="paused = false"
        >
          <div
            class="logos-track flex items-center"
            :class="{ 'logos-paused': paused, 'logos-ready': ready }"
          >
            <div
              v-for="(logo, index) in [...logos, ...logos]"
              :key="index"
              class="logos-item flex-shrink-0 flex items-center justify-center px-6 md:px-10 min-w-[180px] md:min-w-[260px]"
            >
              <img
                :src="logo.src"
                :alt="logo.alt"
                class="logo-img h-16 md:h-24 w-auto max-w-[180px] md:max-w-[260px] object-contain transition-opacity duration-300"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const paused = ref(false)
const ready = ref(false)

const logos = ref([
  { src: '/images/logos/bna.png', alt: 'Banco de la Nación Argentina' },
  { src: '/images/logos/dorado.png', alt: 'Dorado Distribuidora' },
  { src: '/images/logos/el_litoral.png', alt: 'El Litoral - Fábrica de Velas' },
  { src: '/images/logos/enfoque.png', alt: 'Enfoque Display and Design' },
  { src: '/images/logos/jovenes_brangus.png', alt: 'Jóvenes Brangus Argentina' },
  { src: '/images/logos/nexo.png', alt: 'Nexo' },
  { src: '/images/logos/safico.png', alt: 'Safico' },
  { src: '/images/logos/solimano.png', alt: 'Solimano & Asociados' },
])

onMounted(() => {
  const promises = logos.value.map((logo) => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = resolve
      img.onerror = resolve
      img.src = logo.src
    })
  })
  Promise.all(promises).then(() => {
    ready.value = true
  })
})
</script>

<style scoped>
.logo-img {
  filter: brightness(0) invert(1);
  opacity: 0.5;
}

.logo-img:hover {
  opacity: 0.85;
}

.logos-track {
  width: max-content;
}

.logos-ready {
  animation: scroll-logos 30s linear infinite;
}

.logos-paused {
  animation-play-state: paused;
}

@keyframes scroll-logos {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}
</style>
