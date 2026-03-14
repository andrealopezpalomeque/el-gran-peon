<template>
  <NuxtLayout name="admin">
    <h2 class="font-sans text-brand-olive text-2xl font-semibold mb-6">Rentabilidad</h2>

    <!-- Loading -->
    <div v-if="loading" class="space-y-6">
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div v-for="i in 4" :key="i" class="bg-white border-2 border-brand-olive/10 p-5 animate-pulse">
          <div class="h-3 w-20 bg-brand-olive/10 mb-3" />
          <div class="h-8 w-16 bg-brand-olive/10" />
        </div>
      </div>
      <div class="bg-white border-2 border-brand-olive/10 p-6 h-64 animate-pulse" />
    </div>

    <template v-else-if="analytics">
      <!-- ROW 1: Summary KPIs -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <!-- Ganancia del mes -->
        <div class="bg-white border-2 border-brand-olive/10 p-5">
          <div class="flex items-start justify-between mb-3">
            <p class="font-sans text-brand-olive/50 text-xs uppercase tracking-wide">Ganancia del mes</p>
            <div class="w-8 h-8 flex items-center justify-center" :class="analytics.currentMonth.profit > 0 ? 'bg-green-100' : 'bg-red-100'">
              <svg class="w-4 h-4" :class="analytics.currentMonth.profit > 0 ? 'text-green-700' : 'text-red-600'" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <p class="font-sans text-2xl font-bold" :class="analytics.currentMonth.profit > 0 ? 'text-green-700' : 'text-red-600'">
            {{ formatPrice(analytics.currentMonth.profit) }}
          </p>
        </div>

        <!-- Ingresos del mes -->
        <div class="bg-white border-2 border-brand-olive/10 p-5">
          <div class="flex items-start justify-between mb-3">
            <p class="font-sans text-brand-olive/50 text-xs uppercase tracking-wide">Ingresos del mes</p>
            <div class="w-8 h-8 bg-brand-primary/10 flex items-center justify-center">
              <svg class="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
          <p class="font-sans text-brand-olive text-2xl font-bold">{{ formatPrice(analytics.currentMonth.revenue || 0) }}</p>
        </div>

        <!-- Margen promedio -->
        <div class="bg-white border-2 border-brand-olive/10 p-5">
          <div class="flex items-start justify-between mb-3">
            <p class="font-sans text-brand-olive/50 text-xs uppercase tracking-wide">Margen promedio</p>
            <div class="w-8 h-8 bg-brand-olive/10 flex items-center justify-center">
              <svg class="w-4 h-4 text-brand-olive" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <p class="font-sans text-2xl font-bold" :class="analytics.currentMonth.averageMargin > 0 ? 'text-green-700' : 'text-brand-olive'">
            {{ analytics.currentMonth.averageMargin.toFixed(1) }}%
          </p>
          <div class="mt-2 w-full h-1.5 bg-brand-olive/10">
            <div
              class="h-full"
              :class="analytics.currentMonth.averageMargin > 20 ? 'bg-green-600' : analytics.currentMonth.averageMargin > 0 ? 'bg-yellow-500' : 'bg-red-500'"
              :style="{ width: Math.min(Math.max(analytics.currentMonth.averageMargin, 0), 100) + '%' }"
            />
          </div>
        </div>

        <!-- Valor de inventario -->
        <div class="bg-white border-2 border-brand-olive/10 p-5">
          <div class="flex items-start justify-between mb-3">
            <p class="font-sans text-brand-olive/50 text-xs uppercase tracking-wide">Valor inventario</p>
            <div class="w-8 h-8 bg-brand-primary/10 flex items-center justify-center">
              <svg class="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <p class="font-sans text-brand-primary text-2xl font-bold">{{ formatPrice(analytics.inventoryValue) }}</p>
        </div>
      </div>

      <!-- ROW 2: Top 5 by profit (visual bars) + Low stock alerts side by side -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Top 5 most profitable - horizontal bar visualization -->
        <div class="bg-white border-2 border-brand-olive/10 p-6">
          <h3 class="font-sans text-sm text-brand-olive font-semibold mb-4">Top 5 mas rentables</h3>
          <div class="space-y-4">
            <div v-for="(product, i) in topFiveByProfit" :key="i">
              <div class="flex items-center justify-between mb-1.5">
                <span class="font-sans text-sm text-brand-olive font-medium truncate pr-4">{{ product.name }}</span>
                <span class="font-sans text-sm font-bold text-green-700 whitespace-nowrap">{{ formatPrice(product.profit) }}</span>
              </div>
              <div class="w-full h-3 bg-brand-olive/5">
                <div
                  class="h-full bg-brand-primary transition-all"
                  :style="{ width: maxProfit > 0 ? (product.profit / maxProfit * 100) + '%' : '0%' }"
                />
              </div>
              <div class="flex items-center justify-between mt-1">
                <span class="font-sans text-xs text-brand-olive/40">{{ product.units }} unidades</span>
                <span class="font-sans text-xs font-semibold" :class="product.margin > 20 ? 'text-green-700' : product.margin > 0 ? 'text-yellow-600' : 'text-red-600'">
                  {{ product.margin.toFixed(1) }}% margen
                </span>
              </div>
            </div>
            <p v-if="topFiveByProfit.length === 0" class="font-sans text-sm text-brand-olive/30 text-center py-4">
              Sin datos de ventas
            </p>
          </div>
        </div>

        <!-- Low stock alerts -->
        <div class="bg-white border-2 border-brand-olive/10 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-sans text-sm text-brand-olive font-semibold">Alertas de stock</h3>
            <NuxtLink v-if="analytics.lowStockAlerts.length > 0" to="/compras/nueva" class="font-sans text-xs text-brand-primary font-medium hover:underline">
              Registrar compra →
            </NuxtLink>
          </div>

          <div v-if="analytics.lowStockAlerts.length > 0" class="space-y-3">
            <div
              v-for="item in analytics.lowStockAlerts"
              :key="item.id"
              class="flex items-center gap-4 p-3 border-2 border-red-100 bg-red-50/50"
            >
              <div class="flex-1 min-w-0">
                <p class="font-sans text-sm text-brand-olive font-medium truncate">{{ item.name }}</p>
                <p v-if="item.sku" class="font-sans text-xs text-brand-olive/40">{{ item.sku }}</p>
              </div>
              <div class="text-right">
                <p class="font-sans text-lg font-bold text-red-600">{{ item.stock }}</p>
                <p class="font-sans text-xs text-brand-olive/40">min: {{ item.stockMinimo }}</p>
              </div>
              <!-- Stock level bar -->
              <div class="w-16">
                <div class="w-full h-2 bg-red-200">
                  <div
                    class="h-full bg-red-500"
                    :style="{ width: Math.min((item.stock / item.stockMinimo) * 100, 100) + '%' }"
                  />
                </div>
              </div>
            </div>
          </div>
          <div v-else class="flex flex-col items-center justify-center py-8 text-center">
            <svg class="w-10 h-10 text-green-300 mb-3" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="font-sans text-sm text-brand-olive/40">Todo el stock esta en niveles normales</p>
          </div>
        </div>
      </div>

      <!-- ROW 3: Full profitability table -->
      <div>
        <h3 class="font-sans text-sm text-brand-olive/50 uppercase tracking-wide mb-3">Detalle por producto</h3>
        <div class="bg-white border-2 border-brand-olive/10 overflow-x-auto">
          <table class="w-full font-sans text-sm">
            <thead>
              <tr class="border-b-2 border-brand-olive/10 bg-brand-olive/[0.03]">
                <th
                  v-for="col in columns"
                  :key="col.key"
                  @click="sortBy(col.key)"
                  class="p-4 text-xs uppercase tracking-wide font-medium cursor-pointer hover:text-brand-primary transition-colors select-none"
                  :class="col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'"
                >
                  <span class="inline-flex items-center gap-1" :class="sortField === col.key ? 'text-brand-primary' : 'text-brand-olive/50'">
                    {{ col.label }}
                    <template v-if="sortField === col.key">
                      <svg v-if="sortAsc" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"/></svg>
                      <svg v-else class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                    </template>
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="product in sortedProducts"
                :key="product.name"
                class="border-b border-brand-olive/5 hover:bg-brand-olive/[0.02] transition-colors"
              >
                <td class="p-4 text-brand-olive font-medium">{{ product.name }}</td>
                <td class="p-4 text-center text-brand-olive">{{ product.units }}</td>
                <td class="p-4 text-right text-brand-olive">{{ formatPrice(product.revenue) }}</td>
                <td class="p-4 text-right font-medium" :class="product.profit > 0 ? 'text-green-700' : 'text-red-600'">
                  {{ formatPrice(product.profit) }}
                </td>
                <td class="p-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <div class="w-20 h-2 bg-brand-olive/10">
                      <div
                        class="h-full transition-all"
                        :class="product.margin > 30 ? 'bg-green-600' : product.margin > 15 ? 'bg-yellow-500' : product.margin > 0 ? 'bg-orange-400' : 'bg-red-500'"
                        :style="{ width: Math.min(Math.max(product.margin, 0), 100) + '%' }"
                      />
                    </div>
                    <span
                      class="font-sans text-xs font-bold w-14 text-right"
                      :class="product.margin > 20 ? 'text-green-700' : product.margin > 0 ? 'text-yellow-600' : 'text-red-600'"
                    >
                      {{ product.margin.toFixed(1) }}%
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="sortedProducts.length === 0" class="p-8 text-center">
            <p class="font-sans text-sm text-brand-olive/30">No hay datos de ventas disponibles</p>
          </div>
        </div>
      </div>
    </template>
  </NuxtLayout>
</template>

<script setup>
import { formatPrice } from '~/utils/format'

const { get } = useApi()

const loading = ref(true)
const analytics = ref(null)
const sortField = ref('revenue')
const sortAsc = ref(false)

const columns = [
  { key: 'name', label: 'Producto', align: 'left' },
  { key: 'units', label: 'Unidades', align: 'center' },
  { key: 'revenue', label: 'Ingresos', align: 'right' },
  { key: 'profit', label: 'Ganancia', align: 'right' },
  { key: 'margin', label: 'Margen', align: 'right' },
]

const allProducts = computed(() => {
  if (!analytics.value) return []
  return analytics.value.allProductSales || analytics.value.topProductsByRevenue || []
})

const topFiveByProfit = computed(() => {
  return [...allProducts.value]
    .filter(p => p.profit > 0)
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5)
})

const maxProfit = computed(() => {
  if (topFiveByProfit.value.length === 0) return 0
  return topFiveByProfit.value[0].profit
})

const sortedProducts = computed(() => {
  const list = [...allProducts.value]
  list.sort((a, b) => {
    const va = a[sortField.value]
    const vb = b[sortField.value]
    if (typeof va === 'string') {
      return sortAsc.value ? va.localeCompare(vb) : vb.localeCompare(va)
    }
    return sortAsc.value ? va - vb : vb - va
  })
  return list
})

function sortBy(field) {
  if (sortField.value === field) {
    sortAsc.value = !sortAsc.value
  } else {
    sortField.value = field
    sortAsc.value = false
  }
}

onMounted(async () => {
  try {
    analytics.value = await get('/api/dashboard/analytics')
  } catch (error) {
    console.error('Error loading analytics:', error)
  } finally {
    loading.value = false
  }
})
</script>
