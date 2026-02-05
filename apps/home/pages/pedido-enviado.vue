<template>
  <div class="container mx-auto px-4 md:px-6 py-16 md:py-24 text-center max-w-xl">
    <!-- Success icon -->
    <div class="flex items-center justify-center w-16 h-16 mx-auto border-2 border-brand-primary">
      <svg class="w-8 h-8 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
    </div>

    <h1 class="font-display text-brand-primary text-3xl md:text-4xl mt-8">PEDIDO ENVIADO</h1>

    <p class="font-serif text-brand-olive text-lg mt-6 leading-relaxed">
      Tu pedido ha sido registrado correctamente
    </p>
    <p class="font-serif text-brand-olive/60 mt-2 leading-relaxed">
      Te contactaremos por WhatsApp para confirmar detalles y coordinar entrega
    </p>

    <!-- WhatsApp CTA -->
    <a
      v-if="whatsappUrl"
      :href="whatsappUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex items-center justify-center gap-3 w-full mt-10 py-4 bg-[#25D366] text-white font-sans font-medium text-sm tracking-wide hover:bg-[#22c55e] transition-colors duration-200"
    >
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
      CONTINUAR EN WHATSAPP
    </a>

    <p v-if="whatsappUrl" class="font-sans text-xs text-brand-olive/50 mt-3">
      No se abrio WhatsApp? Comunicate directamente al
      <a href="tel:+543794007759" class="text-brand-primary hover:text-brand-primary/80 transition-colors">+54 379 400 7759</a>
    </p>

    <NuxtLink
      to="/productos"
      class="inline-block mt-10 font-sans text-sm text-brand-primary underline underline-offset-4 hover:text-brand-primary/80 transition-colors duration-200"
    >
      Seguir comprando
    </NuxtLink>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const route = useRoute()

const whatsappUrl = computed(() => {
  const encoded = route.query.whatsapp
  if (encoded) {
    try {
      return decodeURIComponent(encoded)
    } catch {
      return null
    }
  }
  return null
})

useHead({
  title: 'Pedido Enviado | El Gran Peon',
})
</script>
