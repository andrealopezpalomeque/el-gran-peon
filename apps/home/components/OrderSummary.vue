<template>
  <div class="border border-brand-olive/20 p-6">
    <h2 class="font-display text-brand-primary text-lg mb-6">RESUMEN DEL PEDIDO</h2>

    <div class="space-y-4">
      <div
        v-for="(item, idx) in items"
        :key="(item.productId || '') + (item.customizationKey || '') + idx"
        class="flex items-start justify-between gap-3"
      >
        <div class="flex-1 min-w-0">
          <p class="font-sans text-sm text-brand-olive">{{ item.productName }}</p>
          <template v-if="item.customizations">
            <p v-for="(c, key) in item.customizations" :key="key" class="font-sans text-xs text-brand-olive/60">
              {{ c.label }}: {{ c.value }}
              <template v-if="c.text"> — "{{ c.text }}"</template>
              <template v-if="c.logoUrl"> (logo adjunto)</template>
              <span v-if="c.extraPrice > 0" class="text-brand-olive/40">(+{{ formatPrice(c.extraPrice) }})</span>
            </p>
          </template>
          <p class="font-sans text-xs text-brand-olive/50">x{{ item.quantity }}</p>
          <p v-if="item.freeShipping" class="font-sans text-xs text-brand-primary/80">Envío gratis</p>
        </div>
        <span class="font-sans text-sm text-brand-olive shrink-0">
          {{ formatPrice(item.unitPrice * item.quantity) }}
        </span>
      </div>
    </div>

    <div class="border-t border-brand-olive/20 mt-6 pt-4 space-y-3">
      <div class="flex items-center justify-between">
        <span class="font-sans text-sm text-brand-olive">Subtotal</span>
        <span class="font-sans text-sm text-brand-olive">{{ formatPrice(subtotal) }}</span>
      </div>

      <div v-if="discountAmount > 0" class="flex items-center justify-between">
        <span class="font-sans text-sm text-brand-primary">10% descuento (transferencia/efectivo)</span>
        <span class="font-sans text-sm text-brand-primary">-{{ formatPrice(discountAmount) }}</span>
      </div>

      <div class="flex items-center justify-between pt-2 border-t border-brand-olive/10">
        <span class="font-sans text-sm font-bold text-brand-olive">Total</span>
        <span class="font-sans text-lg font-bold text-brand-primary">{{ formatPrice(total) }}</span>
      </div>

      <p class="font-sans text-xs text-brand-olive/50">
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
  discountAmount: { type: Number, default: 0 },
  total: { type: Number, required: true },
})
</script>
