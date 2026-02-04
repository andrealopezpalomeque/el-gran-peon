<template>
  <div>
    <NuxtLayout name="admin">
      <h2 class="font-sans text-brand-olive text-2xl font-semibold mb-6">Dashboard</h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white border-2 border-brand-olive/10 p-6">
          <p class="font-sans text-brand-olive/60 text-xs uppercase tracking-wide mb-2">Productos</p>
          <p class="font-sans text-brand-primary text-3xl font-bold">{{ stats.products }}</p>
        </div>

        <div class="bg-white border-2 border-brand-olive/10 p-6">
          <p class="font-sans text-brand-olive/60 text-xs uppercase tracking-wide mb-2">Categorias</p>
          <p class="font-sans text-brand-primary text-3xl font-bold">{{ stats.categories }}</p>
        </div>

        <div class="bg-white border-2 border-brand-olive/10 p-6">
          <p class="font-sans text-brand-olive/60 text-xs uppercase tracking-wide mb-2">Pedidos</p>
          <p class="font-sans text-brand-primary text-3xl font-bold">{{ stats.orders }}</p>
        </div>

        <div class="bg-white border-2 border-brand-olive/10 p-6">
          <p class="font-sans text-brand-olive/60 text-xs uppercase tracking-wide mb-2">Pedidos Nuevos</p>
          <p class="font-sans text-brand-primary text-3xl font-bold">{{ stats.newOrders }}</p>
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup>
const { get } = useApi()

const stats = ref({
  products: 0,
  categories: 0,
  orders: 0,
  newOrders: 0,
})

onMounted(async () => {
  try {
    const [products, categories] = await Promise.all([
      get('/api/products/all'),
      get('/api/categories/all'),
    ])

    let orders = []
    try {
      orders = await get('/api/orders')
    } catch (e) {
      // Orders endpoint may not be available yet
    }

    stats.value = {
      products: products.length || 0,
      categories: categories.length || 0,
      orders: orders.length || 0,
      newOrders: orders.filter?.(o => o.status === 'nuevo')?.length || 0,
    }
  } catch (error) {
    console.error('Error loading stats:', error)
  }
})
</script>
