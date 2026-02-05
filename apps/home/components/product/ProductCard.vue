<template>
  <NuxtLink :to="`/productos/${product.slug}`" class="group block">
    <!-- Image -->
    <div class="aspect-[3/4] overflow-hidden bg-brand-cream">
      <img
        v-if="product.images && product.images.length && !imgBroken"
        :src="product.images[0].url"
        :alt="product.name"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        @error="imgBroken = true"
      />
      <div v-else class="w-full h-full flex items-center justify-center">
        <img src="/images/icon.png" alt="" class="w-16 h-16 opacity-20" />
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
import { ref } from 'vue'
import { formatPrice } from '~/utils/format'

defineProps({
  product: {
    type: Object,
    required: true,
  },
})

const imgBroken = ref(false)
</script>
