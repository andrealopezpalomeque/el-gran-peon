<template>
  <div v-if="products.length">
    <h2 class="font-display uppercase text-brand-primary text-2xl md:text-3xl text-center mb-2">
      DESTACADOS
    </h2>
    <p class="font-serif text-brand-olive/70 text-center mb-10 md:mb-14">
      Lo que elegimos para vos
    </p>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
      <ProductProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
      />
    </div>
  </div>
  <div v-else-if="loaded" class="text-center py-12">
    <p class="font-display uppercase text-brand-primary text-2xl mb-4">DESTACADOS</p>
    <p class="font-serif text-brand-olive/60">Próximamente</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const { get } = useApi()
const products = ref([])
const loaded = ref(false)

onMounted(async () => {
  const data = await get('/api/products?featured=true&limit=6')
  if (data && data.length) {
    products.value = data
  }
  loaded.value = true
})
</script>
