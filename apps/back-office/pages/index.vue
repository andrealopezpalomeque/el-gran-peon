<template>
  <div>
    <NuxtLayout name="admin">
      <h2 class="font-sans text-brand-olive text-2xl font-semibold mb-6">Dashboard</h2>

      <!-- Loading -->
      <div v-if="loading">
        <!-- Attention skeleton -->
        <div class="mb-8">
          <div class="h-3 w-48 bg-brand-olive/10 mb-3" />
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div v-for="i in 3" :key="'a'+i" class="bg-white border-2 border-brand-olive/10 border-l-4 border-l-brand-olive/20 p-6 animate-pulse">
              <div class="h-3 w-20 bg-brand-olive/10 mb-3" />
              <div class="h-8 w-12 bg-brand-olive/10 mb-2" />
              <div class="h-2 w-32 bg-brand-olive/10" />
            </div>
          </div>
        </div>
        <!-- KPIs skeleton -->
        <div class="mb-8">
          <div class="h-3 w-40 bg-brand-olive/10 mb-3" />
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            <div v-for="i in 5" :key="'k'+i" class="bg-white border-2 border-brand-olive/10 p-6 animate-pulse">
              <div class="h-3 w-20 bg-brand-olive/10 mb-3" />
              <div class="h-8 w-16 bg-brand-olive/10" />
            </div>
          </div>
        </div>
        <!-- Chart skeleton -->
        <div class="mb-8">
          <div class="h-3 w-40 bg-brand-olive/10 mb-3" />
          <div class="bg-white border-2 border-brand-olive/10 p-6 h-64 animate-pulse" />
        </div>
        <!-- Management skeleton -->
        <div>
          <div class="h-3 w-24 bg-brand-olive/10 mb-3" />
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            <div v-for="i in 7" :key="'m'+i" class="bg-white border-2 border-brand-olive/10 p-6 animate-pulse">
              <div class="h-3 w-20 bg-brand-olive/10 mb-3" />
              <div class="h-8 w-12 bg-brand-olive/10" />
            </div>
          </div>
        </div>
      </div>

      <template v-else>
        <!-- Section 1: Atencion requerida -->
        <div class="mb-8">
          <h3 class="font-sans text-sm text-brand-olive/50 uppercase tracking-wide mb-3">Atencion requerida</h3>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <NuxtLink
              to="/pedidos?status=nuevo"
              class="bg-white border-2 border-brand-olive/10 p-6 hover:border-brand-primary/30 transition-colors border-l-4"
              :class="stats.newOrders > 0 ? 'border-l-brand-primary' : 'border-l-brand-olive/20'"
            >
              <p class="font-sans text-brand-olive/60 text-xs uppercase tracking-wide mb-2">Pedidos nuevos</p>
              <p class="font-sans text-brand-primary text-3xl font-bold">{{ stats.newOrders }}</p>
              <p class="font-sans text-xs text-brand-olive/40 mt-1">Requieren contacto</p>
            </NuxtLink>

            <NuxtLink
              to="/pedidos"
              class="bg-white border-2 border-brand-olive/10 p-6 hover:border-brand-primary/30 transition-colors border-l-4"
              :class="stats.inProcess > 0 ? 'border-l-brand-primary' : 'border-l-brand-olive/20'"
            >
              <p class="font-sans text-brand-olive/60 text-xs uppercase tracking-wide mb-2">En proceso</p>
              <p class="font-sans text-brand-primary text-3xl font-bold">{{ stats.inProcess }}</p>
              <p class="font-sans text-xs text-brand-olive/40 mt-1">Contactados, en conversacion o confirmados</p>
            </NuxtLink>

            <NuxtLink
              to="/productos"
              class="bg-white border-2 border-brand-olive/10 p-6 hover:border-brand-primary/30 transition-colors border-l-4"
              :class="lowStockCount > 0 ? 'border-l-brand-primary' : 'border-l-brand-olive/20'"
            >
              <p class="font-sans text-brand-olive/60 text-xs uppercase tracking-wide mb-2">Stock bajo</p>
              <p class="font-sans text-brand-primary text-3xl font-bold">{{ lowStockCount }}</p>
              <p class="font-sans text-xs text-brand-olive/40 mt-1">Productos por debajo del minimo</p>
            </NuxtLink>
          </div>
        </div>

        <!-- Section 2: KPIs del mes -->
        <div class="mb-8">
          <h3 class="font-sans text-sm text-brand-olive/50 uppercase tracking-wide mb-3">KPIs del mes</h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            <div class="bg-white border-2 border-brand-olive/10 p-6">
              <p class="font-sans text-brand-olive/60 text-xs uppercase tracking-wide mb-2">Ventas</p>
              <p class="font-sans text-brand-primary text-3xl font-bold">{{ currentMonth.salesCount || 0 }}</p>
            </div>

            <div class="bg-white border-2 border-brand-olive/10 p-6">
              <p class="font-sans text-brand-olive/60 text-xs uppercase tracking-wide mb-2">Ingresos</p>
              <p class="font-sans text-brand-primary text-3xl font-bold">{{ formatPrice(currentMonth.revenue || 0) }}</p>
            </div>

            <div class="bg-white border-2 border-brand-olive/10 p-6">
              <p class="font-sans text-brand-olive/60 text-xs uppercase tracking-wide mb-2">Ganancia</p>
              <p class="font-sans text-brand-primary text-3xl font-bold">{{ formatPrice(currentMonth.profit || 0) }}</p>
            </div>

            <div class="bg-white border-2 border-brand-olive/10 p-6">
              <p class="font-sans text-brand-olive/60 text-xs uppercase tracking-wide mb-2">Margen %</p>
              <p
                class="font-sans text-3xl font-bold"
                :class="(currentMonth.averageMargin || 0) > 0 ? 'text-green-700' : 'text-red-600'"
              >
                {{ (currentMonth.averageMargin || 0).toFixed(1) }}%
              </p>
            </div>

            <div class="bg-white border-2 border-brand-olive/10 p-6">
              <p class="font-sans text-brand-olive/60 text-xs uppercase tracking-wide mb-2">Ticket promedio</p>
              <p class="font-sans text-brand-primary text-3xl font-bold">{{ formatPrice(currentMonth.averageTicket || 0) }}</p>
            </div>
          </div>
        </div>

        <!-- Section 3: Ventas por mes -->
        <div v-if="analytics?.monthlySales?.length" class="mb-8">
          <h3 class="font-sans text-sm text-brand-olive/50 uppercase tracking-wide mb-3">Ventas por mes</h3>
          <div class="bg-white border-2 border-brand-olive/10 p-6">
            <div class="h-64">
              <ClientOnly>
                <AdminBarChart
                  :labels="chartLabels"
                  :datasets="chartDatasets"
                />
              </ClientOnly>
            </div>
          </div>
        </div>

        <!-- Section 4: Productos mas vendidos -->
        <div v-if="analytics?.topProductsByRevenue?.length" class="mb-8">
          <h3 class="font-sans text-sm text-brand-olive/50 uppercase tracking-wide mb-3">Productos mas vendidos</h3>
          <div class="bg-white border-2 border-brand-olive/10 overflow-x-auto">
            <table class="w-full font-sans text-sm">
              <thead>
                <tr class="border-b-2 border-brand-olive/10">
                  <th class="text-left p-4 text-brand-olive/60 text-xs uppercase tracking-wide font-medium">#</th>
                  <th class="text-left p-4 text-brand-olive/60 text-xs uppercase tracking-wide font-medium">Producto</th>
                  <th class="text-right p-4 text-brand-olive/60 text-xs uppercase tracking-wide font-medium">Unidades</th>
                  <th class="text-right p-4 text-brand-olive/60 text-xs uppercase tracking-wide font-medium">Ingresos</th>
                  <th class="text-right p-4 text-brand-olive/60 text-xs uppercase tracking-wide font-medium">Ganancia</th>
                  <th class="text-right p-4 text-brand-olive/60 text-xs uppercase tracking-wide font-medium">Margen</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(product, index) in analytics.topProductsByRevenue.slice(0, 10)"
                  :key="index"
                  class="border-b border-brand-olive/5"
                >
                  <td class="p-4 text-brand-olive/40">{{ index + 1 }}</td>
                  <td class="p-4 text-brand-olive font-medium">{{ product.name }}</td>
                  <td class="p-4 text-right text-brand-olive">{{ product.units }}</td>
                  <td class="p-4 text-right text-brand-olive">{{ formatPrice(product.revenue) }}</td>
                  <td class="p-4 text-right text-brand-olive">{{ formatPrice(product.profit) }}</td>
                  <td
                    class="p-4 text-right font-medium"
                    :class="product.margin > 0 ? 'text-green-700' : 'text-red-600'"
                  >
                    {{ product.margin.toFixed(1) }}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Section 5: Gestion -->
        <div>
          <h3 class="font-sans text-sm text-brand-olive/50 uppercase tracking-wide mb-3">Gestion</h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            <NuxtLink
              to="/productos"
              class="bg-white border-2 border-brand-olive/10 p-6 hover:border-brand-primary/30 transition-colors"
            >
              <p class="font-sans text-brand-olive/60 text-xs uppercase tracking-wide mb-2">Productos</p>
              <p class="font-sans text-brand-primary text-3xl font-bold">{{ stats.products }}</p>
              <p class="font-sans text-xs text-brand-olive/40 mt-1">Publicados en la tienda</p>
            </NuxtLink>

            <NuxtLink
              to="/categorias"
              class="bg-white border-2 border-brand-olive/10 p-6 hover:border-brand-primary/30 transition-colors"
            >
              <p class="font-sans text-brand-olive/60 text-xs uppercase tracking-wide mb-2">Categorias</p>
              <p class="font-sans text-brand-primary text-3xl font-bold">{{ stats.categories }}</p>
              <p class="font-sans text-xs text-brand-olive/40 mt-1">Organizando el catalogo</p>
            </NuxtLink>

            <NuxtLink
              to="/pedidos"
              class="bg-white border-2 border-brand-olive/10 p-6 hover:border-brand-primary/30 transition-colors"
            >
              <p class="font-sans text-brand-olive/60 text-xs uppercase tracking-wide mb-2">Total pedidos</p>
              <p class="font-sans text-brand-primary text-3xl font-bold">{{ stats.totalOrders }}</p>
              <p class="font-sans text-xs text-brand-olive/40 mt-1">Desde el inicio</p>
            </NuxtLink>

            <NuxtLink
              to="/promocodes"
              class="bg-white border-2 border-brand-olive/10 p-6 hover:border-brand-primary/30 transition-colors"
            >
              <p class="font-sans text-brand-olive/60 text-xs uppercase tracking-wide mb-2">Codigos promo</p>
              <p class="font-sans text-brand-primary text-3xl font-bold">{{ stats.activePromoCodes }}</p>
              <p class="font-sans text-xs text-brand-olive/40 mt-1">Activos actualmente</p>
            </NuxtLink>

            <NuxtLink
              to="/suscriptores"
              class="bg-white border-2 border-brand-olive/10 p-6 hover:border-brand-primary/30 transition-colors"
            >
              <p class="font-sans text-brand-olive/60 text-xs uppercase tracking-wide mb-2">Suscriptores</p>
              <p class="font-sans text-brand-primary text-3xl font-bold">{{ stats.subscribers }}</p>
              <p class="font-sans text-xs text-brand-olive/40 mt-1">Registrados por email</p>
            </NuxtLink>

            <NuxtLink
              to="/compras"
              class="bg-white border-2 border-brand-olive/10 p-6 hover:border-brand-primary/30 transition-colors"
            >
              <p class="font-sans text-brand-olive/60 text-xs uppercase tracking-wide mb-2">Compras</p>
              <p class="font-sans text-brand-primary text-3xl font-bold">{{ analytics?.purchasesThisMonth?.count || 0 }}</p>
              <p class="font-sans text-xs text-brand-olive/40 mt-1">Este mes</p>
            </NuxtLink>

            <div class="bg-white border-2 border-brand-olive/10 p-6">
              <p class="font-sans text-brand-olive/60 text-xs uppercase tracking-wide mb-2">Valor inventario</p>
              <p class="font-sans text-brand-primary text-3xl font-bold">{{ formatPrice(analytics?.inventoryValue || 0) }}</p>
              <p class="font-sans text-xs text-brand-olive/40 mt-1">Costo total en stock</p>
            </div>
          </div>
        </div>
      </template>
    </NuxtLayout>
  </div>
</template>

<script setup>
import { formatPrice } from '~/utils/format'

const { get } = useApi()

const loading = ref(true)
const analytics = ref(null)
const stats = ref({
  products: 0,
  categories: 0,
  totalOrders: 0,
  newOrders: 0,
  inProcess: 0,
  activePromoCodes: 0,
  subscribers: 0,
})

const currentMonth = computed(() => analytics.value?.currentMonth || {})
const lowStockCount = computed(() => analytics.value?.lowStockAlerts?.length || 0)

const chartLabels = computed(() =>
  (analytics.value?.monthlySales || []).map(s => s.monthShort)
)

const chartDatasets = computed(() => [
  {
    label: 'Ingresos',
    data: (analytics.value?.monthlySales || []).map(s => s.revenue),
  },
])

onMounted(async () => {
  try {
    const [analyticsData, products, categories, orders, promoCodes, subscribers] = await Promise.all([
      get('/api/dashboard/analytics'),
      get('/api/products/all'),
      get('/api/categories/all'),
      get('/api/orders').catch(() => []),
      get('/api/promocodes').catch(() => []),
      get('/api/subscribe').catch(() => []),
    ])

    analytics.value = analyticsData

    const inProcessStatuses = ['contactado', 'en_conversacion', 'confirmado']
    stats.value = {
      products: products.length,
      categories: categories.length,
      totalOrders: orders.length,
      newOrders: orders.filter(o => o.status === 'nuevo').length,
      inProcess: orders.filter(o => inProcessStatuses.includes(o.status)).length,
      activePromoCodes: (promoCodes || []).filter(p => p.isActive).length,
      subscribers: (subscribers || []).length,
    }
  } catch (error) {
    console.error('Error loading dashboard:', error)
  } finally {
    loading.value = false
  }
})
</script>
