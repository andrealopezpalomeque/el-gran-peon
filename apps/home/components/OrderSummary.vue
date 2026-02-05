<template>
  <div class="border border-brand-olive/20 p-6">
    <h2 class="font-display text-brand-primary text-lg mb-6">RESUMEN DEL PEDIDO</h2>

    <div class="space-y-4">
      <div
        v-for="item in items"
        :key="item.productId"
        class="flex items-start justify-between gap-3"
      >
        <div class="flex-1 min-w-0">
          <p class="font-sans text-sm text-brand-olive">{{ item.productName }}</p>
          <p class="font-sans text-xs text-brand-olive/50">x{{ item.quantity }}</p>
        </div>
        <span class="font-sans text-sm text-brand-olive shrink-0">
          {{ formatPrice(item.unitPrice * item.quantity) }}
        </span>
      </div>
    </div>

    <div class="border-t border-brand-olive/20 mt-6 pt-4">
      <div class="flex items-center justify-between">
        <span class="font-sans text-sm text-brand-olive">Subtotal</span>
        <span class="font-sans text-lg font-bold text-brand-primary">{{ formatPrice(subtotal) }}</span>
      </div>
      <p class="font-sans text-xs text-brand-olive/50 mt-2">
        Total a confirmar via WhatsApp
      </p>
    </div>
  </div>
</template>

<script setup>
import { formatPrice } from '~/utils/format'

defineProps({
  items: { type: Array, required: true },
  subtotal: { type: Number, required: true },
})
</script>
