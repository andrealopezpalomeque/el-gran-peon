<template>
  <div>
    <!-- Section 1: Hero Philosophy -->
    <section class="bg-brand-cream py-20 md:py-32">
      <div class="container mx-auto px-6">
        <div class="max-w-3xl mx-auto text-center">
          <h1 class="font-display uppercase text-brand-primary text-3xl md:text-hero-mobile lg:text-hero mb-8">
            QUIÉNES SOMOS
          </h1>
          <div class="space-y-6 font-serif text-brand-olive leading-relaxed text-base md:text-lg">
            <p>
              Creemos en el valor de las cosas bien hechas. En un mundo que cambia constantemente, nosotros elegimos la permanencia. Cada pieza que creamos responde a una lógica simple: hacer objetos que acompañen el tiempo, que se usen con orgullo y que mantengan su sentido más allá de las modas.
            </p>
            <p>
              El Gran Peón nace del respeto por la tradición y el oficio. Trabajamos con materiales nobles, atendemos cada detalle y buscamos la durabilidad en todo lo que hacemos. No seguimos tendencias. Creamos herencia.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 2: Cápsula Raíz -->
    <section class="bg-white py-20 md:py-28">
      <div class="container mx-auto px-6">
        <div class="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <!-- Left: Text -->
          <div>
            <span class="font-sans text-xs uppercase tracking-widest text-brand-olive/60">
              LANZAMIENTO
            </span>
            <h2 class="font-display uppercase text-brand-primary text-3xl mt-3 mb-2">
              CÁPSULA RAÍZ
            </h2>
            <p class="font-serif text-brand-olive/70 mb-6">
              Nuestra primera colección
            </p>
            <div class="space-y-4 font-serif text-brand-olive leading-relaxed">
              <p>
                Antes del nombre, antes del oficio, antes incluso de la forma, está la raíz. Es lo que sostiene cuando el tiempo empuja, cuando las modas pasan.
              </p>
              <p>
                Cápsula Raíz presenta quince piezas que definen nuestra identidad. Cada producto responde a una lógica simple: hacer cosas hechas para durar, como las cosas bien hechas.
              </p>
            </div>
            <NuxtLink
              to="/productos?coleccion=capsula-raiz"
              class="btn-primary mt-8 inline-flex"
            >
              VER CÁPSULA RAÍZ
            </NuxtLink>
          </div>

          <!-- Right: Image placeholder -->
          <div class="aspect-[4/5] bg-brand-cream flex items-center justify-center border border-brand-olive/10">
            <div class="text-center px-8">
              <svg class="w-12 h-12 mx-auto text-brand-olive/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
              </svg>
              <p class="font-sans text-sm text-brand-olive/30">Fotografía de producto</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 3: Nuestro Oficio -->
    <section class="bg-brand-olive py-20 md:py-28">
      <div class="container mx-auto px-6">
        <h2 class="font-display uppercase text-brand-cream text-3xl text-center mb-16">
          NUESTRO OFICIO
        </h2>
        <div class="grid md:grid-cols-3 gap-12 md:gap-8 lg:gap-12">
          <!-- Materiales -->
          <div class="text-center">
            <div class="w-12 h-12 mx-auto mb-6 flex items-center justify-center">
              <svg class="w-10 h-10 text-brand-cream/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
              </svg>
            </div>
            <h3 class="font-display uppercase text-brand-cream text-xl mb-4">MATERIALES</h3>
            <p class="font-serif text-brand-cream/80 leading-relaxed">
              Seleccionamos materiales nobles que envejecen con dignidad. Cuero, madera, alpaca, acero. Cada uno elegido por su carácter y durabilidad.
            </p>
          </div>

          <!-- Proceso -->
          <div class="text-center">
            <div class="w-12 h-12 mx-auto mb-6 flex items-center justify-center">
              <svg class="w-10 h-10 text-brand-cream/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17l-5.384-3.108A2.25 2.25 0 014.5 10.028V3.75m6.92 11.42l5.384-3.108A2.25 2.25 0 0019.5 10.028V3.75M12 21.75V15.17" />
              </svg>
            </div>
            <h3 class="font-display uppercase text-brand-cream text-xl mb-4">PROCESO</h3>
            <p class="font-serif text-brand-cream/80 leading-relaxed">
              Cada pieza se trabaja con tiempo y atención. Respetamos los procesos tradicionales que garantizan calidad y permanencia.
            </p>
          </div>

          <!-- Detalle -->
          <div class="text-center">
            <div class="w-12 h-12 mx-auto mb-6 flex items-center justify-center">
              <svg class="w-10 h-10 text-brand-cream/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 class="font-display uppercase text-brand-cream text-xl mb-4">DETALLE</h3>
            <p class="font-serif text-brand-cream/80 leading-relaxed">
              Los detalles definen el carácter de un objeto. Cuidamos cada acabado porque sabemos que las pequeñas cosas marcan la diferencia.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 4: La Herencia -->
    <section class="bg-brand-cream py-20 md:py-28">
      <div class="container mx-auto px-6">
        <div class="max-w-3xl mx-auto text-center">
          <h2 class="font-display uppercase text-brand-primary text-3xl mb-8">
            LA HERENCIA
          </h2>
          <div class="space-y-6 font-serif text-brand-olive leading-relaxed text-base md:text-lg">
            <p>
              El Gran Peón es más que una marca. Es la continuación de una tradición que valoriza el trabajo bien hecho y la permanencia por sobre la novedad.
            </p>
            <p>
              Creamos para quienes entienden que las cosas buenas se compran una sola vez. Para quienes buscan objetos que cuenten historias, que acompañen momentos y que se transmitan con orgullo.
            </p>
            <p>
              Hacemos piezas para durar. Como las cosas bien hechas.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 5: Blog Preview -->
    <section class="bg-white py-20 md:py-28">
      <div class="container mx-auto px-6">
        <div class="max-w-2xl mx-auto text-center">
          <h2 class="font-display uppercase text-brand-primary text-3xl mb-3">
            NOTICIAS Y HISTORIAS
          </h2>
          <p class="font-serif text-brand-olive/70 mb-8">Próximamente</p>
          <p class="font-serif text-brand-olive leading-relaxed">
            Aquí compartiremos historias sobre el oficio, los materiales y las personas que hacen posible cada pieza de El Gran Peón.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'Nosotros | El Gran Peón - Herencia Clásica',
  description: 'Creemos en el valor de las cosas bien hechas. Conocé la historia de El Gran Peón y nuestra Cápsula Raíz, quince piezas que definen nuestra identidad.',
  ogTitle: 'Nosotros | El Gran Peón - Herencia Clásica',
  ogDescription: 'Creemos en el valor de las cosas bien hechas. Conocé la historia de El Gran Peón y nuestra Cápsula Raíz, quince piezas que definen nuestra identidad.',
})
</script>
