<template>
  <div>
    <!-- Section 1: Philosophy Hero -->
    <section class="bg-brand-cream py-20 md:py-32">
      <div class="container mx-auto px-6">
        <div class="max-w-4xl mx-auto text-center">
          <h1 class="font-display uppercase text-brand-primary text-4xl md:text-5xl mb-8">
            QUIÉNES SOMOS
          </h1>
          <div class="mx-auto h-px w-16 bg-brand-primary/30 mb-8" />
          <div class="font-serif text-brand-olive text-lg md:text-xl leading-relaxed space-y-6">
            <p>
              En un mundo que corre detrás de lo inmediato, donde lo nuevo reemplaza a lo viejo sin dejar huella, nosotros elegimos permanecer.
              Elegimos fabricar piezas que no respondan a temporadas sino al tiempo, objetos para usarse, marcarse, acompañar historias y sostener su sentido cuando todo cambia.
            </p>
            <p>
              El Gran Peón nace del respeto por el oficio, de trabajar materiales nobles que todavía tienen algo para decir.
              De cuidar cada detalle como si fuera el más importante.
            </p>
            <p>
              No hacemos moda.<br />
              No seguimos tendencias.<br />
              <em>Creamos herencia.</em>
            </p>
          </div>
          <div class="mt-10 text-center">
            <NuxtLink
              to="/productos"
              class="inline-flex items-center font-sans text-sm text-brand-primary hover:text-brand-primary/80 transition-colors group"
            >
              <span class="border-b border-brand-primary/30 group-hover:border-brand-primary/60 transition-colors">
                Conocé nuestras piezas
              </span>
              <svg class="ml-3 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 2: Nuestro Origen -->
    <section class="bg-brand-cream py-20 md:py-28">
      <div class="container mx-auto px-6">
        <div class="mx-auto max-w-6xl">
          <div class="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <!-- Left: Text -->
            <div>
              <span class="font-sans text-xs font-medium uppercase tracking-[0.25em] text-brand-primary">
                NUESTRO ORIGEN
              </span>
              <h2 class="font-serif text-brand-olive text-3xl md:text-4xl font-light leading-tight mt-4">
                NACIMOS DEL RESPETO POR EL OFICIO
              </h2>
              <div class="mt-5 h-px w-12 bg-brand-primary" />
              <div class="mt-6 space-y-4 font-serif text-brand-olive/80 leading-relaxed">
                <p>
                  El Gran Peón nace de una decisión.
                </p>
                <p>
                  Elegimos hacer las cosas como deben hacerse.<br />
                  Sin atajos. Sin apuro.<br />
                  Con atención al detalle y dando valor a cada pieza más allá de lo material.
                </p>
                <p>
                  Trabajamos con materiales nobles, porque lo auténtico se reconoce al tacto.<br />
                  Lo que vale la pena, se siente distinto.
                </p>
                <p>
                  Elegimos hacer lo que se usa con orgullo.<br />
                  Lo que se hereda.
                </p>
                <p>
                  Piezas hechas para durar.<br />
                  Como las cosas bien hechas.
                </p>
              </div>
            </div>

            <!-- Right: Enhanced Workshop Image -->
            <div class="relative aspect-[4/5] overflow-hidden">
              <img
                src="/images/workshop.jpg"
                alt="Artesano trabajando cuero en el taller de El Gran Peón"
                class="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 3: Cápsula Raíz -->
    <section class="bg-white py-20 md:py-28">
      <div class="container mx-auto px-6">
        <div class="mx-auto max-w-6xl">
          <div class="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <!-- Left: Text -->
            <div>
              <span class="font-sans text-xs uppercase tracking-[0.25em] text-brand-olive/60">
                LANZAMIENTO
              </span>
              <h2 class="font-display uppercase text-brand-primary text-3xl md:text-4xl mt-3 mb-2">
                CÁPSULA RAÍZ
              </h2>
              <div class="mt-3 h-px w-12 bg-brand-primary" />
              <p class="font-serif text-brand-olive/70 mt-6 mb-6">
                Nuestra primera colección
              </p>
              <div class="space-y-4 font-serif text-brand-olive leading-relaxed">
                <p>
                  Antes del nombre, antes del oficio, antes incluso de la forma, está la raíz. Es lo que sostiene cuando el tiempo empuja, cuando las modas pasan.
                </p>
                <p>
                  Cápsula Raíz presenta piezas que definen nuestra identidad. Cada producto responde a una lógica simple: hacer cosas hechas para durar, como las cosas bien hechas.
                </p>
              </div>
              <NuxtLink
                to="/productos?coleccion=capsula-raiz"
                class="btn-primary mt-8 inline-flex"
              >
                VER CÁPSULA RAÍZ
              </NuxtLink>
            </div>

            <!-- Right: Image -->
            <div class="relative aspect-[4/5] overflow-hidden">
              <img
                :src="capsulaRaizImg"
                alt="Cápsula Raíz - Primera colección de El Gran Peón"
                class="absolute inset-0 w-full h-full object-cover object-[30%_center]"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 4: Nuestro Oficio -->
    <section class="bg-brand-primary py-20 md:py-28">
      <div class="container mx-auto px-6">
        <p class="mb-3 text-center font-sans text-xs uppercase tracking-[0.25em] text-brand-cream/50">
          Lo que nos define
        </p>
        <h2 class="font-display uppercase text-brand-cream text-3xl md:text-4xl text-center">
          NUESTRO OFICIO
        </h2>
        <div class="mx-auto mt-4 h-px w-12 bg-brand-cream/30" />

        <div class="mt-16 grid md:grid-cols-3 gap-12 md:gap-8 lg:gap-12">
          <!-- Materiales -->
          <div class="text-center">
            <h3 class="font-display uppercase text-brand-cream text-2xl md:text-3xl mb-4">MATERIALES</h3>
            <p class="font-serif text-brand-cream/80 leading-relaxed">
              Seleccionamos materiales nobles que envejecen con dignidad. Cuero, madera, alpaca, acero. Cada uno elegido por su carácter y durabilidad.
            </p>
          </div>

          <!-- Proceso -->
          <div class="text-center">
            <h3 class="font-display uppercase text-brand-cream text-2xl md:text-3xl mb-4">PROCESO</h3>
            <p class="font-serif text-brand-cream/80 leading-relaxed">
              Cada pieza se trabaja con tiempo y atención. Respetamos los procesos tradicionales que garantizan calidad y permanencia.
            </p>
          </div>

          <!-- Detalle -->
          <div class="text-center">
            <h3 class="font-display uppercase text-brand-cream text-2xl md:text-3xl mb-4">DETALLE</h3>
            <p class="font-serif text-brand-cream/80 leading-relaxed">
              Los detalles definen el carácter de un objeto. Cuidamos cada acabado porque sabemos que las pequeñas cosas marcan la diferencia.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 5: La Herencia -->
    <section class="bg-white py-20 md:py-28">
      <div class="container mx-auto px-6">
        <div class="max-w-3xl mx-auto text-center">
          <h2 class="font-display uppercase text-brand-primary text-3xl md:text-4xl mb-6">
            LA HERENCIA
          </h2>
          <div class="mx-auto h-px w-16 bg-brand-primary/30 mb-8" />
          <div class="font-serif text-brand-olive text-lg leading-relaxed space-y-6">
            <p>
              El Gran Peón no es solo una marca.<br />
              Es una forma de entender el valor de las cosas.
            </p>
            <p>
              Creamos para quienes saben que lo bien hecho no se reemplaza. Se conserva.<br />
              Para quienes buscan objetos que acompañen historias, que se marquen con el uso y que con el tiempo se vuelvan parte de algo más grande.
            </p>
            <p>
              Porque la herencia no empieza cuando se entrega.<br />
              Empieza cuando algo vale la pena quedarse.
            </p>
          </div>
          <div class="mt-12 pt-8 border-t border-brand-primary/10">
            <p class="font-serif text-brand-primary text-xl md:text-2xl italic">
              "Hecho para durar. Como las cosas bien hechas."
            </p>
          </div>
          <div class="mt-12 text-center">
            <NuxtLink
              to="/productos"
              class="btn-primary inline-flex items-center"
            >
              VER TODOS LOS PRODUCTOS
              <svg class="ml-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 6: Noticias y Historias -->
    <section class="bg-brand-cream py-20 md:py-28">
      <div class="container mx-auto px-6">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-12">
            <h2 class="font-display uppercase text-brand-primary text-3xl md:text-4xl">
              NOTICIAS E HISTORIAS
            </h2>
            <div class="mx-auto mt-4 h-px w-12 bg-brand-primary/30" />
            <p class="font-serif text-brand-olive/70 mt-6">Próximamente</p>
          </div>

          <!-- 3-column placeholder grid -->
          <div class="grid md:grid-cols-3 gap-6">
            <div v-for="n in 3" :key="n" class="group">
              <div class="aspect-square bg-white border border-brand-olive/10 flex items-center justify-center">
                <svg class="w-10 h-10 text-brand-olive/15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                </svg>
              </div>
              <div class="mt-4">
                <div class="h-3 w-20 bg-brand-olive/10 mb-3" />
                <div class="h-5 w-full bg-brand-olive/10 mb-2" />
                <div class="h-5 w-3/4 bg-brand-olive/10" />
              </div>
            </div>
          </div>

          <div class="text-center mt-12">
            <p class="font-serif text-brand-olive/60 text-sm">
              Aquí compartiremos historias sobre el oficio, los materiales y las personas que hacen posible cada pieza de El Gran Peón.
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import capsulaRaizImg from '~/assets/images/capsula-raiz-hero.jpg'

useSeoMeta({
  title: 'Nosotros | El Gran Peón - Herencia Clásica',
  description: 'Creemos en el valor de las cosas bien hechas. Conocé la historia de El Gran Peón, nuestro oficio artesanal y la Cápsula Raíz: quince piezas que definen nuestra identidad.',
  ogTitle: 'Nosotros | El Gran Peón - Herencia Clásica',
  ogDescription: 'Creemos en el valor de las cosas bien hechas. Conocé la historia de El Gran Peón, nuestro oficio artesanal y la Cápsula Raíz: quince piezas que definen nuestra identidad.',
  ogImage: 'https://elgranpeon.com/images/hero.jpg',
})
</script>
