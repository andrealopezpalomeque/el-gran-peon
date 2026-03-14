<template>
  <div>
    <NuxtLayout name="admin">
      <h2 class="font-sans text-brand-olive text-2xl font-semibold mb-6">Dashboard</h2>

      <!-- Loading -->
      <div v-if="loading" class="space-y-6">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="i in 4" :key="i" class="bg-white border-2 border-brand-olive/10 p-5 animate-pulse">
            <div class="h-3 w-20 bg-brand-olive/10 mb-3" />
            <div class="h-8 w-16 bg-brand-olive/10" />
          </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 bg-white border-2 border-brand-olive/10 p-6 h-72 animate-pulse" />
          <div class="bg-white border-2 border-brand-olive/10 p-6 h-72 animate-pulse" />
        </div>
      </div>

      <template v-else>
        <!-- ROW 1: Alert banner (only if there are alerts) -->
        <div
          v-if="stats.newOrders > 0 || stats.inProcess > 0 || lowStockCount > 0"
          class="mb-6 bg-brand-primary/[0.04] border-2 border-brand-primary/20 p-4"
        >
          <div class="flex items-center gap-6 flex-wrap">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span class="font-sans text-sm font-semibold text-brand-primary">Atencion requerida</span>
            </div>

            <NuxtLink v-if="stats.newOrders > 0" to="/pedidos?status=nuevo" class="flex items-center gap-2 px-3 py-1.5 bg-brand-primary text-brand-cream font-sans text-xs font-medium hover:bg-brand-primary/90 transition-colors">
              <span class="w-5 h-5 flex items-center justify-center bg-brand-cream/20 font-bold text-xs">{{ stats.newOrders }}</span>
              {{ stats.newOrders === 1 ? 'pedido nuevo' : 'pedidos nuevos' }}
            </NuxtLink>

            <NuxtLink v-if="stats.inProcess > 0" to="/pedidos" class="flex items-center gap-2 px-3 py-1.5 border-2 border-brand-primary/30 text-brand-primary font-sans text-xs font-medium hover:bg-brand-primary/5 transition-colors">
              <span class="font-bold">{{ stats.inProcess }}</span>
              en proceso
            </NuxtLink>

            <NuxtLink v-if="lowStockCount > 0" to="/productos" class="flex items-center gap-2 px-3 py-1.5 border-2 border-red-300 text-red-700 font-sans text-xs font-medium hover:bg-red-50 transition-colors">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span class="font-bold">{{ lowStockCount }}</span>
              stock bajo
            </NuxtLink>
          </div>
        </div>

        <!-- ROW 2: KPI Cards with icons -->
        <div class="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <!-- Ventas -->
          <div class="bg-white border-2 border-brand-olive/10 p-5">
            <div class="flex items-start justify-between mb-3">
              <p class="font-sans text-brand-olive/50 text-xs uppercase tracking-wide">Ventas</p>
              <div class="w-8 h-8 bg-brand-primary/10 flex items-center justify-center">
                <svg class="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
            <p class="font-sans text-brand-olive text-3xl font-bold">{{ currentMonth.salesCount || 0 }}</p>
            <p class="font-sans text-xs text-brand-olive/40 mt-1">este mes</p>
          </div>

          <!-- Ingresos -->
          <div class="bg-white border-2 border-brand-olive/10 p-5">
            <div class="flex items-start justify-between mb-3">
              <p class="font-sans text-brand-olive/50 text-xs uppercase tracking-wide">Ingresos</p>
              <div class="w-8 h-8 bg-green-100 flex items-center justify-center">
                <svg class="w-4 h-4 text-green-700" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <p class="font-sans text-brand-olive text-2xl font-bold">{{ formatPrice(currentMonth.revenue || 0) }}</p>
            <p class="font-sans text-xs text-brand-olive/40 mt-1">facturado</p>
          </div>

          <!-- Ganancia -->
          <div class="bg-white border-2 border-brand-olive/10 p-5">
            <div class="flex items-start justify-between mb-3">
              <p class="font-sans text-brand-olive/50 text-xs uppercase tracking-wide">Ganancia</p>
              <div class="w-8 h-8 flex items-center justify-center" :class="(currentMonth.profit || 0) >= 0 ? 'bg-green-100' : 'bg-red-100'">
                <svg class="w-4 h-4" :class="(currentMonth.profit || 0) >= 0 ? 'text-green-700' : 'text-red-600'" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <p class="font-sans text-2xl font-bold" :class="(currentMonth.profit || 0) >= 0 ? 'text-green-700' : 'text-red-600'">
              {{ formatPrice(currentMonth.profit || 0) }}
            </p>
            <p class="font-sans text-xs text-brand-olive/40 mt-1">neta</p>
          </div>

          <!-- Margen -->
          <div class="bg-white border-2 border-brand-olive/10 p-5">
            <div class="flex items-start justify-between mb-3">
              <p class="font-sans text-brand-olive/50 text-xs uppercase tracking-wide">Margen</p>
              <div class="w-8 h-8 bg-brand-olive/10 flex items-center justify-center">
                <svg class="w-4 h-4 text-brand-olive" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <p class="font-sans text-2xl font-bold" :class="(currentMonth.averageMargin || 0) > 0 ? 'text-green-700' : 'text-brand-olive'">
              {{ (currentMonth.averageMargin || 0).toFixed(1) }}%
            </p>
            <!-- Mini progress bar for margin -->
            <div class="mt-2 w-full h-1.5 bg-brand-olive/10">
              <div
                class="h-full transition-all"
                :class="(currentMonth.averageMargin || 0) > 0 ? 'bg-green-600' : 'bg-red-500'"
                :style="{ width: Math.min(Math.max(currentMonth.averageMargin || 0, 0), 100) + '%' }"
              />
            </div>
          </div>

          <!-- Ticket promedio -->
          <div class="bg-white border-2 border-brand-olive/10 p-5">
            <div class="flex items-start justify-between mb-3">
              <p class="font-sans text-brand-olive/50 text-xs uppercase tracking-wide">Ticket prom.</p>
              <div class="w-8 h-8 bg-brand-primary/10 flex items-center justify-center">
                <svg class="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <p class="font-sans text-brand-olive text-2xl font-bold">{{ formatPrice(currentMonth.averageTicket || 0) }}</p>
            <p class="font-sans text-xs text-brand-olive/40 mt-1">por pedido</p>
          </div>
        </div>

        <!-- ROW 3: Chart (2/3) + Inventory Sidebar (1/3) -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <!-- Bar chart -->
          <div class="lg:col-span-2 bg-white border-2 border-brand-olive/10 p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-sans text-sm text-brand-olive font-semibold">Ingresos mensuales</h3>
              <span class="font-sans text-xs text-brand-olive/40">ultimos 12 meses</span>
            </div>
            <div class="h-64">
              <ClientOnly>
                <AdminBarChart
                  v-if="analytics?.monthlySales?.length"
                  :labels="chartLabels"
                  :datasets="chartDatasets"
                />
                <div v-else class="h-full flex items-center justify-center">
                  <p class="font-sans text-sm text-brand-olive/30">Sin datos de ventas</p>
                </div>
              </ClientOnly>
            </div>
          </div>

          <!-- Inventory & Purchases sidebar -->
          <div class="space-y-6">
            <!-- Inventory value card -->
            <div class="bg-white border-2 border-brand-olive/10 p-6">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-brand-primary/10 flex items-center justify-center">
                  <svg class="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <p class="font-sans text-xs text-brand-olive/50 uppercase tracking-wide">Valor del inventario</p>
                  <p class="font-sans text-xl font-bold text-brand-olive">{{ formatPrice(analytics?.inventoryValue || 0) }}</p>
                </div>
              </div>
              <div class="border-t-2 border-brand-olive/10 pt-3 flex items-center justify-between">
                <span class="font-sans text-xs text-brand-olive/50">Productos activos</span>
                <span class="font-sans text-sm font-semibold text-brand-olive">{{ stats.products }}</span>
              </div>
            </div>

            <!-- Purchases this month -->
            <NuxtLink to="/compras" class="block bg-white border-2 border-brand-olive/10 p-6 hover:border-brand-primary/30 transition-colors">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 bg-brand-olive/10 flex items-center justify-center">
                  <svg class="w-5 h-5 text-brand-olive" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                  </svg>
                </div>
                <div>
                  <p class="font-sans text-xs text-brand-olive/50 uppercase tracking-wide">Compras del mes</p>
                  <p class="font-sans text-xl font-bold text-brand-olive">{{ analytics?.purchasesThisMonth?.count || 0 }}</p>
                </div>
              </div>
              <div class="border-t-2 border-brand-olive/10 pt-3 flex items-center justify-between">
                <span class="font-sans text-xs text-brand-olive/50">Invertido</span>
                <span class="font-sans text-sm font-semibold text-brand-olive">{{ formatPrice(analytics?.purchasesThisMonth?.totalSpent || 0) }}</span>
              </div>
            </NuxtLink>

            <!-- Low stock alerts -->
            <div v-if="lowStockCount > 0" class="bg-white border-2 border-red-200 p-6">
              <div class="flex items-center gap-2 mb-3">
                <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span class="font-sans text-xs text-red-600 font-semibold uppercase tracking-wide">Stock bajo</span>
              </div>
              <div class="space-y-2">
                <div
                  v-for="item in (analytics?.lowStockAlerts || []).slice(0, 4)"
                  :key="item.id"
                  class="flex items-center justify-between py-1.5 border-b border-red-100 last:border-0"
                >
                  <span class="font-sans text-sm text-brand-olive truncate pr-2">{{ item.name }}</span>
                  <span class="font-sans text-xs font-semibold text-red-600 whitespace-nowrap">{{ item.stock }} ud.</span>
                </div>
              </div>
              <NuxtLink to="/compras/nueva" class="block mt-3 text-center font-sans text-xs text-brand-primary font-medium hover:underline">
                Registrar compra →
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- ROW 4: Top Products Table -->
        <div v-if="analytics?.topProductsByRevenue?.length" class="mb-6">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-sans text-sm text-brand-olive/50 uppercase tracking-wide">Productos mas vendidos</h3>
            <NuxtLink to="/rentabilidad" class="font-sans text-xs text-brand-primary font-medium hover:underline">
              Ver rentabilidad completa →
            </NuxtLink>
          </div>
          <div class="bg-white border-2 border-brand-olive/10 overflow-x-auto">
            <table class="w-full font-sans text-sm">
              <thead>
                <tr class="border-b-2 border-brand-olive/10">
                  <th class="text-left p-4 text-brand-olive/50 text-xs uppercase tracking-wide font-medium">#</th>
                  <th class="text-left p-4 text-brand-olive/50 text-xs uppercase tracking-wide font-medium">Producto</th>
                  <th class="text-center p-4 text-brand-olive/50 text-xs uppercase tracking-wide font-medium">Unidades</th>
                  <th class="text-right p-4 text-brand-olive/50 text-xs uppercase tracking-wide font-medium">Ingresos</th>
                  <th class="text-right p-4 text-brand-olive/50 text-xs uppercase tracking-wide font-medium">Ganancia</th>
                  <th class="text-right p-4 text-brand-olive/50 text-xs uppercase tracking-wide font-medium">Margen</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(product, index) in analytics.topProductsByRevenue.slice(0, 10)"
                  :key="index"
                  class="border-b border-brand-olive/5"
                >
                  <td class="p-4 text-brand-olive/30 font-medium">{{ index + 1 }}</td>
                  <td class="p-4 text-brand-olive font-medium">{{ product.name }}</td>
                  <td class="p-4 text-center text-brand-olive">{{ product.units }}</td>
                  <td class="p-4 text-right text-brand-olive">{{ formatPrice(product.revenue) }}</td>
                  <td class="p-4 text-right font-medium" :class="product.profit > 0 ? 'text-green-700' : 'text-red-600'">
                    {{ formatPrice(product.profit) }}
                  </td>
                  <td class="p-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <div class="w-16 h-1.5 bg-brand-olive/10">
                        <div
                          class="h-full"
                          :class="product.margin > 20 ? 'bg-green-600' : product.margin > 0 ? 'bg-yellow-500' : 'bg-red-500'"
                          :style="{ width: Math.min(Math.max(product.margin, 0), 100) + '%' }"
                        />
                      </div>
                      <span class="font-sans text-xs font-semibold w-12 text-right" :class="product.margin > 0 ? 'text-green-700' : 'text-red-600'">
                        {{ product.margin.toFixed(1) }}%
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ROW 5: Quick management links -->
        <div>
          <h3 class="font-sans text-sm text-brand-olive/50 uppercase tracking-wide mb-3">Acceso rapido</h3>
          <div class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <NuxtLink
              v-for="link in quickLinks"
              :key="link.to"
              :to="link.to"
              class="bg-white border-2 border-brand-olive/10 p-4 hover:border-brand-primary/30 transition-colors text-center"
            >
              <p class="font-sans text-brand-primary text-2xl font-bold">{{ link.count }}</p>
              <p class="font-sans text-brand-olive/50 text-xs mt-1">{{ link.label }}</p>
            </NuxtLink>
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

const quickLinks = computed(() => [
  { to: '/productos', count: stats.value.products, label: 'Productos' },
  { to: '/categorias', count: stats.value.categories, label: 'Categorias' },
  { to: '/pedidos', count: stats.value.totalOrders, label: 'Pedidos' },
  { to: '/compras', count: analytics.value?.purchasesThisMonth?.count || 0, label: 'Compras' },
  { to: '/promocodes', count: stats.value.activePromoCodes, label: 'Promo codes' },
  { to: '/suscriptores', count: stats.value.subscribers, label: 'Suscriptores' },
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
