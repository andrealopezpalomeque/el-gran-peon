<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <div class="bg-white border-2 border-brand-olive/10 p-4">
      <p class="font-sans text-brand-olive/60 text-xs uppercase tracking-wide mb-1">Total pedidos</p>
      <p class="font-sans text-brand-primary text-2xl font-bold">{{ totalOrders }}</p>
    </div>

    <div class="bg-white border-2 border-brand-olive/10 p-4">
      <p class="font-sans text-brand-olive/60 text-xs uppercase tracking-wide mb-1">Valor promedio</p>
      <p class="font-sans text-brand-primary text-2xl font-bold">{{ averageValue }}</p>
    </div>

    <div class="bg-white border-2 border-brand-olive/10 p-4">
      <p class="font-sans text-brand-olive/60 text-xs uppercase tracking-wide mb-1">Tasa completados</p>
      <p class="font-sans text-brand-primary text-2xl font-bold">{{ completionRate }}%</p>
    </div>

    <div class="bg-white border-2 border-brand-olive/10 p-4">
      <p class="font-sans text-brand-olive/60 text-xs uppercase tracking-wide mb-1">Producto mas vendido</p>
      <p class="font-sans text-brand-primary text-sm font-bold truncate" :title="topProduct">{{ topProduct }}</p>
    </div>
  </div>
</template>

<script setup>
import { formatPrice } from '~/utils/format'

const props = defineProps({
  orders: { type: Array, default: () => [] },
})

const totalOrders = computed(() => props.orders.length)

const averageValue = computed(() => {
  if (props.orders.length === 0) return formatPrice(0)
  const sum = props.orders.reduce((acc, o) => acc + (o.adjustedAmount || o.totalAmount || 0), 0)
  return formatPrice(Math.round(sum / props.orders.length))
})

const completionRate = computed(() => {
  if (props.orders.length === 0) return 0
  const completed = props.orders.filter(o => o.status === 'entregado').length
  return Math.round((completed / props.orders.length) * 100)
})

const topProduct = computed(() => {
  if (props.orders.length === 0) return '-'
  const counts = {}
  for (const order of props.orders) {
    for (const item of (order.items || [])) {
      const name = item.name || item.productName || 'Producto'
      counts[name] = (counts[name] || 0) + (item.quantity || 1)
    }
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  return sorted.length > 0 ? sorted[0][0] : '-'
})
</script>
