<template>
  <div class="absolute top-full right-0 mt-2 w-80 bg-brand-cream border border-brand-olive/20 z-50">
    <!-- Empty state -->
    <div v-if="cart.items.length === 0" class="px-5 py-6 text-center">
      <p class="font-sans text-sm text-brand-olive/60">No hay articulos en tu carrito.</p>
      <NuxtLink
        to="/productos"
        class="inline-block mt-3 font-sans text-xs text-brand-primary underline underline-offset-4 hover:text-brand-primary/80 transition-colors"
      >
        Ver productos
      </NuxtLink>
    </div>

    <!-- Items -->
    <template v-else>
      <div class="max-h-72 overflow-y-auto">
        <div
          v-for="item in cart.items"
          :key="item.productId"
          class="flex gap-3 px-4 py-3 border-b border-brand-olive/10 last:border-b-0"
        >
          <!-- Thumbnail -->
          <NuxtLink :to="`/productos/${item.productSlug}`" class="shrink-0 w-14 h-14 bg-brand-olive/5 overflow-hidden">
            <img
              v-if="item.image"
              :src="item.image"
              :alt="item.productName"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <img src="/images/icon.png" alt="" class="w-6 h-6 opacity-20" />
            </div>
          </NuxtLink>

          <!-- Details -->
          <div class="flex-1 min-w-0">
            <NuxtLink
              :to="`/productos/${item.productSlug}`"
              class="font-sans text-xs font-medium text-brand-olive hover:text-brand-primary transition-colors line-clamp-2"
            >
              {{ item.productName }}
            </NuxtLink>
            <p class="font-sans text-xs text-brand-olive/50 mt-0.5">
              {{ item.quantity }} × {{ formatPrice(item.unitPrice) }}
            </p>
          </div>

          <!-- Item total -->
          <span class="shrink-0 font-sans text-xs font-medium text-brand-olive self-center">
            {{ formatPrice(item.unitPrice * item.quantity) }}
          </span>
        </div>
      </div>

      <!-- Footer -->
      <div class="border-t border-brand-olive/20 px-4 py-3">
        <div class="flex items-center justify-between mb-3">
          <span class="font-sans text-xs text-brand-olive/60 uppercase tracking-wide">Subtotal</span>
          <span class="font-sans text-sm font-bold text-brand-primary">{{ formatPrice(cart.subtotal) }}</span>
        </div>
        <NuxtLink
          to="/carrito"
          class="block w-full py-2.5 bg-brand-primary text-brand-cream font-sans font-medium text-xs tracking-wide text-center hover:bg-brand-primary/90 transition-colors duration-200"
        >
          VER CARRITO
        </NuxtLink>
      </div>
    </template>
  </div>
</template>

<script setup>
import { formatPrice } from '~/utils/format'

const cart = useCartStore()
</script>
