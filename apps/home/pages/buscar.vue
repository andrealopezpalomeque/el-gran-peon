<template>
  <div class="container mx-auto px-4 md:px-6 pt-4 pb-10 md:pt-6 md:pb-16">
    <!-- Breadcrumb -->
    <UiBreadcrumb :items="breadcrumbItems" />

    <!-- Page title -->
    <h1 class="font-display text-brand-primary text-3xl md:text-4xl mt-4">
      RESULTADOS DE BÚSQUEDA
    </h1>

    <p v-if="query" class="font-sans text-sm text-brand-olive/60 mt-2">
      {{ totalResults }} resultado{{ totalResults !== 1 ? 's' : '' }} para "{{ query }}"
    </p>

    <!-- Loading -->
    <div v-if="loading" class="mt-8">
      <UiSkeletonGrid :count="6" />
    </div>

    <!-- Results Grid -->
    <div v-else-if="products.length > 0" class="mt-8">
      <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <ProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
          :show-actions="true"
          :compact-actions="true"
          @add-to-cart="addToCart"
        />
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="query && !loading" class="mt-16 text-center">
      <p class="font-sans text-brand-olive/60">
        No encontramos productos para "{{ query }}"
      </p>
      <p class="font-sans text-sm text-brand-olive/40 mt-2">
        Intentá con otro término o explorá nuestras categorías
      </p>
      <NuxtLink
        to="/productos"
        class="inline-block mt-6 font-sans text-xs uppercase tracking-wide border-2 border-brand-primary text-brand-primary px-6 py-2 hover:bg-brand-primary hover:text-brand-cream transition-colors"
      >
        Ver todos los productos
      </NuxtLink>
    </div>

    <!-- No query -->
    <div v-else class="mt-16 text-center">
      <p class="font-sans text-brand-olive/60">
        Escribí un término para buscar productos
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const route = useRoute()
const { get } = useApi()
const cart = useCartStore()

const query = computed(() => route.query.q || '')
const products = ref([])
const loading = ref(false)
const totalResults = computed(() => products.value.length)

const breadcrumbItems = computed(() => [
  { label: 'Inicio', to: '/' },
  { label: query.value ? `Búsqueda: ${query.value}` : 'Búsqueda' },
])

async function search(q) {
  if (!q || q.length < 2) {
    products.value = []
    return
  }
  loading.value = true
  const data = await get(`/api/products/search?q=${encodeURIComponent(q)}&limit=50&categoryLimit=0`)
  if (data && data.products) {
    products.value = data.products
  } else {
    products.value = []
  }
  loading.value = false
}

function addToCart(product) {
  if (product.stock === 0) return
  cart.addProduct(product, 1, [])
}

// Search on mount and when query changes
watch(query, (val) => search(val), { immediate: true })

useHead({
  title: computed(() => query.value ? `Buscar: ${query.value}` : 'Buscar'),
})
</script>
