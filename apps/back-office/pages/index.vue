<template>
  <div>
    <NuxtLayout name="admin">
      <h2 class="font-sans text-brand-olive text-2xl font-semibold mb-6">Dashboard</h2>

      <!-- Loading -->
      <div v-if="loading">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div v-for="i in 4" :key="i" class="bg-white border-2 border-brand-olive/10 p-6 animate-pulse">
            <div class="h-3 w-20 bg-brand-olive/10 mb-3" />
            <div class="h-8 w-12 bg-brand-olive/10" />
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="i in 3" :key="i" class="bg-white border-2 border-brand-olive/10 p-6 animate-pulse">
            <div class="h-3 w-20 bg-brand-olive/10 mb-3" />
            <div class="h-8 w-12 bg-brand-olive/10" />
          </div>
        </div>
      </div>

      <template v-else>
        <!-- Order Stats -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <NuxtLink
            to="/pedidos?status=nuevo"
            class="bg-white border-2 border-brand-olive/10 p-6 hover:border-brand-primary/30 transition-colors"
          >
            <p class="font-sans text-brand-olive/60 text-xs uppercase tracking-wide mb-2">Pedidos nuevos</p>
            <p class="font-sans text-brand-primary text-3xl font-bold">{{ stats.newOrders }}</p>
          </NuxtLink>

          <NuxtLink
            to="/pedidos"
            class="bg-white border-2 border-brand-olive/10 p-6 hover:border-brand-primary/30 transition-colors"
          >
            <p class="font-sans text-brand-olive/60 text-xs uppercase tracking-wide mb-2">En proceso</p>
            <p class="font-sans text-brand-primary text-3xl font-bold">{{ stats.inProcess }}</p>
          </NuxtLink>

          <div class="bg-white border-2 border-brand-olive/10 p-6">
            <p class="font-sans text-brand-olive/60 text-xs uppercase tracking-wide mb-2">Completados este mes</p>
            <p class="font-sans text-brand-primary text-3xl font-bold">{{ stats.completedThisMonth }}</p>
          </div>

          <div class="bg-white border-2 border-brand-olive/10 p-6">
            <p class="font-sans text-brand-olive/60 text-xs uppercase tracking-wide mb-2">Ingresos potenciales</p>
            <p class="font-sans text-brand-primary text-2xl font-bold">{{ stats.potentialRevenue }}</p>
          </div>
        </div>

        <!-- Catalog Stats -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <NuxtLink
            to="/productos"
            class="bg-white border-2 border-brand-olive/10 p-6 hover:border-brand-primary/30 transition-colors"
          >
            <p class="font-sans text-brand-olive/60 text-xs uppercase tracking-wide mb-2">Productos</p>
            <p class="font-sans text-brand-primary text-3xl font-bold">{{ stats.products }}</p>
          </NuxtLink>

          <NuxtLink
            to="/categorias"
            class="bg-white border-2 border-brand-olive/10 p-6 hover:border-brand-primary/30 transition-colors"
          >
            <p class="font-sans text-brand-olive/60 text-xs uppercase tracking-wide mb-2">Categorias</p>
            <p class="font-sans text-brand-primary text-3xl font-bold">{{ stats.categories }}</p>
          </NuxtLink>

          <NuxtLink
            to="/pedidos"
            class="bg-white border-2 border-brand-olive/10 p-6 hover:border-brand-primary/30 transition-colors"
          >
            <p class="font-sans text-brand-olive/60 text-xs uppercase tracking-wide mb-2">Total pedidos</p>
            <p class="font-sans text-brand-primary text-3xl font-bold">{{ stats.totalOrders }}</p>
          </NuxtLink>
        </div>
      </template>
    </NuxtLayout>
  </div>
</template>

<script setup>
import { formatPrice } from '~/utils/format'

const { get } = useApi()

const loading = ref(true)
const stats = ref({
  products: 0,
  categories: 0,
  totalOrders: 0,
  newOrders: 0,
  inProcess: 0,
  completedThisMonth: 0,
  potentialRevenue: '$0',
})

onMounted(async () => {
  try {
    const [products, categories, orders] = await Promise.all([
      get('/api/products/all'),
      get('/api/categories/all'),
      get('/api/orders').catch(() => []),
    ])

    const inProcessStatuses = ['contactado', 'en_conversacion', 'confirmado']
    const revenueStatuses = ['confirmado', 'pagado']

    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const completedThisMonth = orders.filter(o => {
      if (o.status !== 'entregado') return false
      const ts = o.updatedAt?._seconds ? o.updatedAt._seconds * 1000
        : o.updatedAt?.seconds ? o.updatedAt.seconds * 1000
        : new Date(o.updatedAt).getTime()
      return ts >= thisMonthStart.getTime()
    }).length

    const potentialSum = orders
      .filter(o => revenueStatuses.includes(o.status))
      .reduce((sum, o) => sum + (o.adjustedAmount || o.totalAmount || 0), 0)

    stats.value = {
      products: products.length || 0,
      categories: categories.length || 0,
      totalOrders: orders.length || 0,
      newOrders: orders.filter(o => o.status === 'nuevo').length,
      inProcess: orders.filter(o => inProcessStatuses.includes(o.status)).length,
      completedThisMonth,
      potentialRevenue: formatPrice(potentialSum),
    }
  } catch (error) {
    console.error('Error loading stats:', error)
  } finally {
    loading.value = false
  }
})
</script>
