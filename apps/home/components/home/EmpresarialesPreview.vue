<template>
  <section class="bg-brand-olive py-16 md:py-24">
    <div class="container mx-auto px-6">
      <div class="max-w-3xl mx-auto text-center md:text-left">
        <p class="font-sans text-xs uppercase tracking-widest text-brand-cream/60 mb-4">
          REGALOS EMPRESARIALES
        </p>
        <h2 class="font-display uppercase text-brand-cream text-3xl md:text-4xl mb-6">
          TU MARCA CON IDENTIDAD DE CAMPO
        </h2>
        <p class="font-serif text-brand-cream/80 text-base md:text-lg leading-relaxed max-w-lg mx-auto md:mx-0 mb-10">
          Creamos piezas únicas para empresas que quieren regalar algo con identidad.
          Mates, cuchillos y artículos de cuero personalizados con tu marca.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
          <NuxtLink
            to="/empresariales"
            class="inline-block border-2 border-brand-cream text-brand-cream font-sans text-sm uppercase tracking-widest px-8 py-3 hover:bg-brand-cream hover:text-brand-olive transition-colors duration-200 text-center"
          >
            VER MÁS
          </NuxtLink>
          <a
            href="https://wa.me/543794007759?text=Hola!%20Quiero%20consultar%20sobre%20regalos%20empresariales%20de%20El%20Gran%20Pe%C3%B3n"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-block bg-brand-cream text-brand-olive font-sans text-sm uppercase tracking-widest px-8 py-3 hover:bg-brand-cream/90 transition-colors duration-200 text-center"
          >
            CONTACTANOS
          </a>
        </div>
      </div>

      <!-- Trust logos placeholder -->
      <div class="mt-16 pt-10 border-t border-brand-cream/20">
        <p class="font-sans text-xs uppercase tracking-widest text-brand-cream/40 text-center mb-6">
          MARCAS QUE CONFÍAN EN NOSOTROS
        </p>
        <div class="flex justify-center gap-8 md:gap-12">
          <div
            v-for="n in 4"
            :key="n"
            class="w-16 h-16 md:w-20 md:h-20 border border-brand-cream/20 flex items-center justify-center"
          >
            <span class="font-sans text-xs text-brand-cream/30">LOGO</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
