<template>
  <div v-if="categories.length">
    <h2 class="font-display uppercase text-brand-primary text-2xl md:text-3xl text-center mb-10 md:mb-14">
      NUESTROS PRODUCTOS
    </h2>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <NuxtLink
        v-for="category in categories"
        :key="category.id"
        :to="`/productos?categoria=${category.slug}`"
        class="group relative aspect-[4/3] overflow-hidden block"
      >
        <!-- Background image or fallback -->
        <div
          v-if="category.image"
          class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          :style="{ backgroundImage: `url(${category.image})` }"
        />
        <div
          v-else
          class="absolute inset-0 bg-brand-primary"
        />
        <!-- Overlay -->
        <div class="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-300" />
        <!-- Category name -->
        <div class="relative z-10 h-full flex items-center justify-center">
          <span class="font-display uppercase text-brand-cream text-xl md:text-2xl">
            {{ category.name.toUpperCase() }}
          </span>
        </div>
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
