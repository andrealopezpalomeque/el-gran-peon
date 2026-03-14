<template>
  <NuxtLayout name="admin">
    <h2 class="font-sans text-brand-olive text-2xl font-semibold mb-6">Rentabilidad</h2>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <p class="font-sans text-brand-olive/60 text-sm">Cargando datos...</p>
    </div>

    <template v-else-if="analytics">
      <!-- Summary KPIs -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div class="bg-white border-2 border-brand-olive/10 p-6">
          <p class="font-sans text-brand-olive/60 text-xs uppercase tracking-wide mb-2">Ganancia del mes</p>
          <p class="font-sans text-3xl font-bold" :class="analytics.currentMonth.profit > 0 ? 'text-green-700' : 'text-red-600'">
            {{ formatPrice(analytics.currentMonth.profit) }}
          </p>
        </div>
        <div class="bg-white border-2 border-brand-olive/10 p-6">
          <p class="font-sans text-brand-olive/60 text-xs uppercase tracking-wide mb-2">Margen promedio</p>
          <p class="font-sans text-3xl font-bold" :class="analytics.currentMonth.averageMargin > 0 ? 'text-green-700' : 'text-brand-olive'">
            {{ analytics.currentMonth.averageMargin.toFixed(1) }}%
          </p>
        </div>
        <div class="bg-white border-2 border-brand-olive/10 p-6">
          <p class="font-sans text-brand-olive/60 text-xs uppercase tracking-wide mb-2">Valor de inventario</p>
          <p class="font-sans text-brand-primary text-3xl font-bold">{{ formatPrice(analytics.inventoryValue) }}</p>
        </div>
      </div>

      <!-- Full profitability table -->
      <div class="mb-8">
        <h3 class="font-sans text-sm text-brand-olive/50 uppercase tracking-wide mb-3">Rentabilidad por producto</h3>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b-2 border-brand-olive/10">
                <th @click="sortBy('name')" class="text-left font-sans text-xs uppercase tracking-wide text-brand-olive/60 py-3 pr-4 cursor-pointer hover:text-brand-primary">
                  Producto {{ sortIcon('name') }}
                </th>
                <th @click="sortBy('units')" class="text-center font-sans text-xs uppercase tracking-wide text-brand-olive/60 py-3 pr-4 cursor-pointer hover:text-brand-primary">
                  Unidades {{ sortIcon('units') }}
                </th>
                <th @click="sortBy('revenue')" class="text-right font-sans text-xs uppercase tracking-wide text-brand-olive/60 py-3 pr-4 cursor-pointer hover:text-brand-primary">
                  Ingresos {{ sortIcon('revenue') }}
                </th>
                <th @click="sortBy('profit')" class="text-right font-sans text-xs uppercase tracking-wide text-brand-olive/60 py-3 pr-4 cursor-pointer hover:text-brand-primary">
                  Ganancia {{ sortIcon('profit') }}
                </th>
                <th @click="sortBy('margin')" class="text-center font-sans text-xs uppercase tracking-wide text-brand-olive/60 py-3 cursor-pointer hover:text-brand-primary">
                  Margen {{ sortIcon('margin') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in sortedProducts" :key="product.name" class="border-b border-brand-olive/5">
                <td class="py-3 pr-4">
                  <span class="font-sans text-sm text-brand-olive font-medium">{{ product.name }}</span>
                </td>
                <td class="py-3 pr-4 text-center">
                  <span class="font-sans text-sm text-brand-olive">{{ product.units }}</span>
                </td>
                <td class="py-3 pr-4 text-right">
                  <span class="font-sans text-sm text-brand-olive">{{ formatPrice(product.revenue) }}</span>
                </td>
                <td class="py-3 pr-4 text-right">
                  <span class="font-sans text-sm font-medium" :class="product.profit > 0 ? 'text-green-700' : 'text-red-600'">
                    {{ formatPrice(product.profit) }}
                  </span>
                </td>
                <td class="py-3 text-center">
                  <span class="font-sans text-sm font-medium" :class="product.margin > 0 ? 'text-green-700' : 'text-red-600'">
                    {{ product.margin.toFixed(1) }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-if="sortedProducts.length === 0" class="py-8 text-center font-sans text-sm text-brand-olive/40">
          No hay datos de ventas disponibles.
        </p>
      </div>

      <!-- Low Stock Alerts -->
      <div v-if="analytics.lowStockAlerts.length > 0">
        <h3 class="font-sans text-sm text-brand-olive/50 uppercase tracking-wide mb-3">Alertas de stock bajo</h3>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b-2 border-brand-olive/10">
                <th class="text-left font-sans text-xs uppercase tracking-wide text-brand-olive/60 py-3 pr-4">Producto</th>
                <th class="text-left font-sans text-xs uppercase tracking-wide text-brand-olive/60 py-3 pr-4">SKU</th>
                <th class="text-center font-sans text-xs uppercase tracking-wide text-brand-olive/60 py-3 pr-4">Stock actual</th>
                <th class="text-center font-sans text-xs uppercase tracking-wide text-brand-olive/60 py-3 pr-4">Stock minimo</th>
                <th class="text-right font-sans text-xs uppercase tracking-wide text-brand-olive/60 py-3">Accion</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in analytics.lowStockAlerts" :key="item.id" class="border-b border-brand-olive/5">
                <td class="py-3 pr-4"><span class="font-sans text-sm text-brand-olive font-medium">{{ item.name }}</span></td>
                <td class="py-3 pr-4"><span class="font-sans text-sm text-brand-olive/60">{{ item.sku || '—' }}</span></td>
                <td class="py-3 pr-4 text-center"><span class="font-sans text-sm text-red-600 font-semibold">{{ item.stock }}</span></td>
                <td class="py-3 pr-4 text-center"><span class="font-sans text-sm text-brand-olive/60">{{ item.stockMinimo }}</span></td>
                <td class="py-3 text-right">
                  <NuxtLink to="/compras/nueva" class="px-3 py-1 font-sans text-xs text-brand-primary border border-brand-primary/30 hover:bg-brand-primary hover:text-brand-cream transition-colors">
                    Registrar compra
                  </NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
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

// All products with sales data (full list, not limited to top 10)
const sortedProducts = computed(() => {
  if (!analytics.value) return []
  const list = [...(analytics.value.allProductSales || analytics.value.topProductsByRevenue)]
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

function sortIcon(field) {
  if (sortField.value !== field) return ''
  return sortAsc.value ? '↑' : '↓'
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
