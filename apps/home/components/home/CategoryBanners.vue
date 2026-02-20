<template>
  <div v-if="categories.length">
    <h2 class="font-display uppercase text-brand-primary text-3xl md:text-4xl text-center mb-2">
      PIEZAS DE EL GRAN PEÓN
    </h2>
    <p class="font-serif text-brand-olive/70 text-center mb-10 md:mb-14">
      Tradición, oficio y materiales nobles en cada detalle.
    </p>
    <div class="flex flex-wrap justify-center gap-4 md:gap-6">
      <NuxtLink
        v-for="category in categories"
        :key="category.id"
        :to="`/productos?categoria=${category.slug}`"
        class="group flex flex-col items-center w-[calc(50%-0.5rem)] md:w-[calc(50%-0.75rem)] lg:w-[calc(25%-1.125rem)]"
      >
        <!-- Product image (transparent bg) -->
        <div class="aspect-square w-full flex items-center justify-center overflow-hidden bg-brand-cream p-4">
          <img
            v-if="category.image"
            :src="category.image"
            :alt="category.name"
            class="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
          <div v-else class="w-16 h-16 bg-brand-primary/10" />
        </div>
        <!-- Category label -->
        <span class="block w-full bg-brand-primary py-2 font-display uppercase text-brand-cream text-sm md:text-base text-center tracking-wide transition-colors duration-300 group-hover:bg-brand-primary/90">
          {{ category.name.toUpperCase() }}
        </span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const { get } = useApi()
const categories = ref([])

onMounted(async () => {
  const data = await get('/api/categories')
  if (data) {
    // Use only parent categories (top-level)
    categories.value = data.filter(cat => !cat.parentId)
  }
})
</script>
