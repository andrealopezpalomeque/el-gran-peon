<template>
  <NuxtLink :to="`/productos/${product.slug}`" class="group block">
    <!-- Image -->
    <div class="aspect-square overflow-hidden">
      <img
        v-if="product.images && product.images.length"
        :src="product.images[0].url"
        :alt="product.name"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div
        v-else
        class="w-full h-full bg-brand-olive/10 flex items-center justify-center"
      >
        <svg class="w-12 h-12 text-brand-olive/30" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24">
          <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    </div>
    <!-- Info -->
    <div class="mt-3">
      <p v-if="product.categoryName" class="font-sans text-xs uppercase tracking-wide text-brand-olive/60">
        {{ product.categoryName }}
      </p>
      <h3 class="font-sans font-medium text-brand-olive text-sm mt-1">
        {{ product.name }}
      </h3>
      <div class="mt-2 flex items-center gap-2">
        <span class="font-sans font-semibold text-brand-primary">
          {{ formatPrice(product.price) }}
        </span>
        <span
          v-if="product.compareAtPrice"
          class="font-sans text-sm text-brand-olive/40 line-through"
        >
          {{ formatPrice(product.compareAtPrice) }}
        </span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup>
import { formatPrice } from '~/utils/format'

defineProps({
  product: {
    type: Object,
    required: true,
  },
})
</script>
