<template>
  <div class="bg-brand-cream">
    <!-- Hero -->
    <section class="py-20 md:py-28">
      <div class="container mx-auto px-6">
        <div class="max-w-3xl mx-auto text-center">
          <h1 class="font-display uppercase text-brand-primary text-4xl md:text-5xl mb-6">
            INFORMACIÓN
          </h1>
          <div class="mx-auto h-px w-16 bg-brand-primary/30 mb-8" />
          <p class="font-serif text-brand-olive/80 text-lg leading-relaxed">
            Todo lo que necesitás saber sobre envíos, cambios, devoluciones y garantía de nuestros productos.
          </p>
        </div>

        <!-- Quick nav -->
        <nav class="flex flex-wrap justify-center gap-4 mt-10">
          <a
            v-for="section in sections"
            :key="section.id"
            :href="`#${section.id}`"
            class="font-sans text-xs uppercase tracking-widest text-brand-primary border border-brand-primary/30 px-5 py-2 hover:bg-brand-primary hover:text-brand-cream transition-colors duration-200"
            @click.prevent="scrollToSection(section.id)"
          >
            {{ section.nav }}
          </a>
        </nav>
      </div>
    </section>

    <!-- Políticas de Envío -->
    <section id="envios" class="py-16 md:py-24 border-t border-brand-primary/10 scroll-mt-24 md:scroll-mt-32">
      <div class="container mx-auto px-6">
        <div class="max-w-3xl mx-auto">
          <span class="font-sans text-xs uppercase tracking-[0.25em] text-brand-primary/60">01</span>
          <h2 class="font-display uppercase text-brand-primary text-3xl md:text-4xl mt-2 mb-4">
            POLÍTICAS DE ENVÍO
          </h2>
          <div class="h-px w-12 bg-brand-primary mb-10" />

          <div class="space-y-8">
            <div>
              <h3 class="font-sans text-sm font-medium uppercase tracking-wide text-brand-olive mb-2">Ámbito de envío</h3>
              <p class="font-serif text-brand-olive/80 leading-relaxed">Realizamos envíos a todo el territorio argentino y también al exterior.</p>
            </div>
            <div>
              <h3 class="font-sans text-sm font-medium uppercase tracking-wide text-brand-olive mb-2">Empresas de transporte</h3>
              <p class="font-serif text-brand-olive/80 leading-relaxed">Trabajamos con Correo Argentino y Andreani. La empresa asignada podrá variar según destino, tipo de producto y modalidad seleccionada.</p>
            </div>
            <div>
              <h3 class="font-sans text-sm font-medium uppercase tracking-wide text-brand-olive mb-2">Días de despacho</h3>
              <p class="font-serif text-brand-olive/80 leading-relaxed">Los envíos se despachan los días lunes, miércoles y viernes, una vez acreditado el pago.</p>
            </div>
            <div>
              <h3 class="font-sans text-sm font-medium uppercase tracking-wide text-brand-olive mb-2">Envío gratuito</h3>
              <p class="font-serif text-brand-olive/80 leading-relaxed">Ofrecemos envío gratuito en compras superiores a $200.000 (pesos argentinos), dentro del territorio nacional.</p>
            </div>
            <div>
              <h3 class="font-sans text-sm font-medium uppercase tracking-wide text-brand-olive mb-2">Envíos express</h3>
              <p class="font-serif text-brand-olive/80 leading-relaxed">Disponemos de modalidad express mediante encomienda 24 hs. Esta opción deberá ser solicitada al momento de la compra y puede implicar costos adicionales.</p>
            </div>
            <div>
              <h3 class="font-sans text-sm font-medium uppercase tracking-wide text-brand-olive mb-2">Retiro en persona</h3>
              <p class="font-serif text-brand-olive/80 leading-relaxed">Se puede optar por retiro presencial en la ciudad de Corrientes Capital. La coordinación se realizará previamente por los canales oficiales de contacto.</p>
            </div>
            <div>
              <h3 class="font-sans text-sm font-medium uppercase tracking-wide text-brand-olive mb-2">Errores en la dirección de envío</h3>
              <p class="font-serif text-brand-olive/80 leading-relaxed">En caso de que el cliente detecte un error en la dirección ingresada, deberá notificarlo inmediatamente luego de realizada la compra. Una vez despachado el pedido, no podremos garantizar modificaciones en los datos de envío.</p>
            </div>
            <div>
              <h3 class="font-sans text-sm font-medium uppercase tracking-wide text-brand-olive mb-2">Paquetes no entregados</h3>
              <p class="font-serif text-brand-olive/80 leading-relaxed">Si el paquete regresa por ausencia reiterada o imposibilidad de entrega, nos pondremos en contacto para coordinar un nuevo envío. Los costos adicionales de reenvío podrán quedar a cargo del comprador.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Cambios y Devoluciones -->
    <section id="cambios" class="py-16 md:py-24 bg-white scroll-mt-24 md:scroll-mt-32">
      <div class="container mx-auto px-6">
        <div class="max-w-3xl mx-auto">
          <span class="font-sans text-xs uppercase tracking-[0.25em] text-brand-primary/60">02</span>
          <h2 class="font-display uppercase text-brand-primary text-3xl md:text-4xl mt-2 mb-4">
            CAMBIOS Y DEVOLUCIONES
          </h2>
          <div class="h-px w-12 bg-brand-primary mb-10" />

          <div class="space-y-8">
            <div>
              <h3 class="font-sans text-sm font-medium uppercase tracking-wide text-brand-olive mb-2">Cambios por arrepentimiento</h3>
              <div class="font-serif text-brand-olive/80 leading-relaxed space-y-3">
                <p>Se aceptan cambios por arrepentimiento dentro de los 10 días corridos desde la recepción del producto.</p>
                <p>El producto deberá encontrarse en óptimas condiciones, sin uso, y en el mismo estado en que fue entregado, incluyendo su packaging original.</p>
                <p>Los costos de envío derivados del cambio por arrepentimiento estarán a cargo del comprador.</p>
              </div>
            </div>
            <div>
              <h3 class="font-sans text-sm font-medium uppercase tracking-wide text-brand-olive mb-2">Productos personalizados</h3>
              <p class="font-serif text-brand-olive/80 leading-relaxed">Los productos personalizados admiten cambio, siempre que se encuentren en perfectas condiciones y dentro del plazo establecido.</p>
            </div>
            <div>
              <h3 class="font-sans text-sm font-medium uppercase tracking-wide text-brand-olive mb-2">Productos con fallas</h3>
              <p class="font-serif text-brand-olive/80 leading-relaxed">En caso de recibir un producto con falla de fabricación, el cliente deberá contactarnos para evaluar la situación. Aceptamos cambios y devoluciones por defectos comprobables.</p>
            </div>
            <div>
              <h3 class="font-sans text-sm font-medium uppercase tracking-wide text-brand-olive mb-2">Modalidad de reintegro</h3>
              <p class="font-serif text-brand-olive/80 leading-relaxed">No realizamos reintegros en dinero. En los casos que correspondan, se otorgará crédito en tienda para utilizar en futuras compras.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Garantía -->
    <section id="garantia" class="py-16 md:py-24 border-t border-brand-primary/10 scroll-mt-24 md:scroll-mt-32">
      <div class="container mx-auto px-6">
        <div class="max-w-3xl mx-auto">
          <span class="font-sans text-xs uppercase tracking-[0.25em] text-brand-primary/60">03</span>
          <h2 class="font-display uppercase text-brand-primary text-3xl md:text-4xl mt-2 mb-4">
            GARANTÍA
          </h2>
          <div class="h-px w-12 bg-brand-primary mb-10" />

          <p class="font-serif text-brand-olive text-lg leading-relaxed mb-10">
            Todos nuestros productos cuentan con una garantía de 10 días corridos por defectos de fabricación.
          </p>

          <div class="space-y-8">
            <div>
              <h3 class="font-sans text-sm font-medium uppercase tracking-wide text-brand-olive mb-2">Cobertura</h3>
              <p class="font-serif text-brand-olive/80 leading-relaxed">La garantía cubre exclusivamente fallas atribuibles al proceso de fabricación.</p>
            </div>
            <div>
              <h3 class="font-sans text-sm font-medium uppercase tracking-wide text-brand-olive mb-2">Exclusiones</h3>
              <p class="font-serif text-brand-olive/80 leading-relaxed">No cubre daños derivados de mal uso, golpes, desgaste natural del producto o falta de mantenimiento adecuado.</p>
            </div>
            <div>
              <h3 class="font-sans text-sm font-medium uppercase tracking-wide text-brand-olive mb-2">Procedimiento para hacer válida la garantía</h3>
              <div class="font-serif text-brand-olive/80 leading-relaxed space-y-3">
                <p>El cliente deberá comunicarse por los canales oficiales enviando:</p>
                <ul class="list-disc list-inside space-y-1 pl-2">
                  <li>Descripción escrita detallando el inconveniente.</li>
                  <li>Fotografías y/o videos donde se evidencie claramente el defecto.</li>
                </ul>
                <p>Una vez evaluado el caso, se determinará si corresponde la reparación o el reemplazo del producto.</p>
              </div>
            </div>
            <div>
              <h3 class="font-sans text-sm font-medium uppercase tracking-wide text-brand-olive mb-2">Productos personalizados</h3>
              <p class="font-serif text-brand-olive/80 leading-relaxed">La garantía no aplica a productos personalizados.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact CTA -->
    <section class="py-16 md:py-20 bg-brand-primary">
      <div class="container mx-auto px-6 text-center">
        <h2 class="font-display uppercase text-brand-cream text-2xl md:text-3xl mb-4">
          ¿TENÉS ALGUNA CONSULTA?
        </h2>
        <p class="font-serif text-brand-cream/80 mb-8">
          Escribinos y te respondemos a la brevedad.
        </p>
        <a
          href="https://wa.me/543794007759?text=Hola%2C%20tengo%20una%20consulta%20sobre%20un%20pedido"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-block border-2 border-brand-cream text-brand-cream font-sans text-sm uppercase tracking-widest px-8 py-3 hover:bg-brand-cream hover:text-brand-primary transition-colors duration-200"
        >
          CONTACTANOS POR WHATSAPP
        </a>
      </div>
    </section>
  </div>
</template>

<script setup>
const sections = [
  { id: 'envios', nav: 'Envíos' },
  { id: 'cambios', nav: 'Cambios y devoluciones' },
  { id: 'garantia', nav: 'Garantía' },
]

const scrollToSection = (id) => {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

useSeoMeta({
  title: 'Información | El Gran Peón - Envíos, Cambios y Garantía',
  description: 'Políticas de envío, cambios, devoluciones y garantía de El Gran Peón. Envíos a todo el país con Correo Argentino y Andreani. Garantía de 10 días por defectos de fabricación.',
  ogTitle: 'Información | El Gran Peón - Envíos, Cambios y Garantía',
  ogDescription: 'Políticas de envío, cambios, devoluciones y garantía de El Gran Peón. Envíos a todo el país con Correo Argentino y Andreani.',
})
</script>
