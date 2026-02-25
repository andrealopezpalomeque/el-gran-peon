<template>
  <div>
    <!-- Hero -->
    <section class="bg-brand-cream pt-4 pb-6 md:pt-6 md:pb-8">
      <div class="container mx-auto px-6">
        <div class="max-w-3xl mx-auto">
          <UiBreadcrumb :items="breadcrumbItems" class="mb-4" />
          <span class="font-sans text-xs uppercase tracking-wide text-brand-olive/50">
            Lanzamiento
          </span>
          <h1 class="font-display uppercase text-brand-primary text-3xl md:text-4xl mt-2">
            EL GRAN PEÓN PRESENTA LA CÁPSULA RAÍZ
          </h1>
          <p class="font-serif text-brand-olive/60 text-lg mt-2">
            Accesorios artesanales hechos en Argentina
          </p>
        </div>
      </div>
    </section>

    <!-- Image -->
    <section class="container mx-auto px-6">
      <div class="max-w-3xl mx-auto">
        <div class="aspect-[16/9] overflow-hidden">
          <img
            :src="capsulaRaizImg"
            alt="Cápsula Raíz - Primera colección de El Gran Peón"
            class="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>

    <!-- Article body -->
    <article class="container mx-auto px-6 py-12 md:py-16">
      <div class="max-w-3xl mx-auto prose-article">
        <p>
          El Gran Peón presenta oficialmente la Cápsula Raíz, una propuesta fundacional que reúne una línea completa de productos fabricados en Corrientes, Argentina.
        </p>
        <p>
          Se trata del inicio de la marca. Una cápsula permanente que reúne productos tradicionales desarrollados con un criterio claro: perdurar en el tiempo.
        </p>

        <h2>Una cápsula completa de accesorios artesanales</h2>
        <p>
          Cada pieza fue diseñada de manera independiente, pero todas convergen bajo un mismo concepto: productos artesanales hechos para durar, como las cosas bien hechas.
        </p>
        <p>Dentro de la cápsula podés encontrar:</p>
        <ul>
          <li><strong>Mates</strong> fabricados en calabaza seleccionada y trabajada manualmente con apliques de alpaca.</li>
          <li><strong>Bombillas</strong> desarrolladas en alpaca maciza con terminaciones cuidadas.</li>
          <li><strong>Cuchillos</strong> de acero con construcción sólida y enfoque funcional.</li>
          <li><strong>Materas</strong> confeccionadas en cuero, pensadas para acompañar el uso real.</li>
        </ul>
        <p>
          Cada producto puede explorarse individualmente dentro de la <NuxtLink to="/productos" class="text-brand-primary border-b border-brand-primary/30 hover:border-brand-primary/60 transition-colors">tienda oficial</NuxtLink>, donde se detallan sus características específicas.
        </p>

        <h2>100% artesanal, hecho en Corrientes, Argentina</h2>
        <p>
          Todos los productos de la Cápsula Raíz son 100% artesanales. La fabricación se realiza en Corrientes Capital, Argentina, respetando procesos manuales y priorizando el control pieza por pieza.
        </p>
        <p>Los materiales principales utilizados en la cápsula incluyen:</p>
        <ul>
          <li>Cuero</li>
          <li>Alpaca</li>
          <li>Acero</li>
          <li>Madera</li>
        </ul>
        <p>
          Cada pieza es probada y revisada antes de salir al mercado, asegurando que cumpla con los estándares de calidad definidos por la marca.
        </p>
        <p>
          No se trata de producción en serie industrial. Se trata de fabricación cuidada, donde el detalle importa.
        </p>

        <h2>Por qué elegir accesorios artesanales que perduren</h2>
        <p>
          Elegir accesorios artesanales implica optar por objetos que no están pensados para el reemplazo inmediato.
        </p>
        <p>A diferencia de los productos industriales masivos, una pieza artesanal:</p>
        <ul>
          <li>Prioriza materiales nobles</li>
          <li>Está construida con intención</li>
          <li>Puede mantenerse y conservarse en el tiempo</li>
          <li>Está pensada para acompañar años de uso</li>
        </ul>
        <p>
          La Cápsula Raíz propone una mirada atemporal sobre el objeto tradicional argentino. Piezas que pueden heredarse con el cuidado adecuado y seguir cumpliendo su función con la misma firmeza.
        </p>

        <h2>La Cápsula Raíz como punto de partida</h2>
        <p>
          Antes del nombre, antes del oficio, antes incluso de la forma, está la raíz.
        </p>
        <p>
          La Cápsula Raíz representa el inicio de El Gran Peón. Es la primera de futuras cápsulas que ampliarán el universo de la marca.
        </p>

        <h2>Preguntas frecuentes</h2>

        <h3>¿Dónde se fabrican los productos de la Cápsula Raíz?</h3>
        <p>Todos los accesorios artesanales se fabrican en Corrientes Capital, Argentina.</p>

        <h3>¿Qué materiales utiliza la Cápsula Raíz?</h3>
        <p>La cápsula integra cuero, alpaca, acero y madera seleccionada.</p>

        <h3>¿Los productos son para uso diario?</h3>
        <p>Sí. Están diseñados para uso real y prolongado, con fabricación 100% artesanal.</p>

        <!-- CTA -->
        <div class="mt-12 pt-8 border-t border-brand-olive/10 text-center not-prose">
          <p class="font-serif text-brand-olive text-lg mb-6">
            La Cápsula Raíz ya se encuentra disponible en la tienda oficial de El Gran Peón.
          </p>
          <NuxtLink
            to="/productos"
            class="inline-block bg-brand-primary text-brand-cream font-sans text-sm uppercase tracking-widest px-8 py-3 hover:bg-brand-primary/90 transition-colors duration-200"
          >
            EXPLORAR LA CÁPSULA RAÍZ
          </NuxtLink>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup>
import capsulaRaizImg from '~/assets/images/capsula-raiz-hero.jpg'

const breadcrumbItems = [
  { label: 'Inicio', to: '/' },
  { label: 'Nosotros', to: '/nosotros' },
  { label: 'Cápsula Raíz', to: null },
]

useSeoMeta({
  title: 'Cápsula Raíz: Accesorios Artesanales Hechos en Argentina | El Gran Peón',
  description: 'El Gran Peón presenta la Cápsula Raíz: mates, bombillas, cuchillos y materas 100% artesanales fabricados en Corrientes, Argentina. Productos hechos para durar.',
  ogTitle: 'Cápsula Raíz: Accesorios Artesanales Hechos en Argentina | El Gran Peón',
  ogDescription: 'Una cápsula permanente de productos tradicionales desarrollados con un criterio claro: perdurar en el tiempo. 100% artesanal, fabricado en Corrientes.',
  ogImage: 'https://elgranpeon.com/images/capsula-raiz-hero.jpg',
})
</script>

<style scoped>
.prose-article {
  @apply font-serif text-brand-olive leading-relaxed;
}
.prose-article p {
  @apply mb-5;
}
.prose-article h2 {
  @apply font-display uppercase text-brand-primary text-xl md:text-2xl mt-10 mb-4;
}
.prose-article h3 {
  @apply font-sans font-semibold text-brand-olive text-base mt-6 mb-2;
}
.prose-article ul {
  @apply mb-5 ml-5 space-y-2;
}
.prose-article li {
  @apply list-disc;
}
.prose-article strong {
  @apply font-semibold text-brand-olive;
}
</style>
