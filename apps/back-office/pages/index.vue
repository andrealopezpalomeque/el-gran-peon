<template>
  <div>
    <NuxtLayout name="admin">
      <h2 class="font-sans text-brand-olive text-2xl font-semibold mb-6">Dashboard</h2>

      <!-- Loading -->
      <div v-if="loading">
        <!-- Attention skeleton -->
        <div class="mb-8">
          <div class="h-3 w-48 bg-brand-olive/10 mb-3" />
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div v-for="i in 2" :key="'a'+i" class="bg-white border-2 border-brand-olive/10 border-l-4 border-l-brand-olive/20 p-6 animate-pulse">
              <div class="h-3 w-20 bg-brand-olive/10 mb-3" />
              <div class="h-8 w-12 bg-brand-olive/10 mb-2" />
              <div class="h-2 w-32 bg-brand-olive/10" />
            </div>
          </div>
        </div>
        <!-- Performance skeleton -->
        <div class="mb-8">
          <div class="h-3 w-40 bg-brand-olive/10 mb-3" />
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div v-for="i in 2" :key="'p'+i" class="bg-white border-2 border-brand-olive/10 p-6 animate-pulse">
              <div class="h-3 w-20 bg-brand-olive/10 mb-3" />
              <div class="h-8 w-12 bg-brand-olive/10 mb-2" />
              <div class="h-2 w-32 bg-brand-olive/10" />
            </div>
          </div>
        </div>
        <!-- Management skeleton -->
        <div>
          <div class="h-3 w-24 bg-brand-olive/10 mb-3" />
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            <div v-for="i in 5" :key="'m'+i" class="bg-white border-2 border-brand-olive/10 p-6 animate-pulse">
              <div class="h-3 w-20 bg-brand-olive/10 mb-3" />
              <div class="h-8 w-12 bg-brand-olive/10 mb-2" />
              <div class="h-2 w-24 bg-brand-olive/10" />
            </div>
          </div>
        </div>
      </div>

      <template v-else>
        <!-- Pedidos que requieren atencion -->
        <div class="mb-8">
          <h3 class="font-sans text-sm text-brand-olive/50 uppercase tracking-wide mb-3">Pedidos que requieren atencion</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
          </div>
        </div>

        <!-- Rendimiento del mes -->
        <div class="mb-8">
          <h3 class="font-sans text-sm text-brand-olive/50 uppercase tracking-wide mb-3">Rendimiento del mes</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="bg-white border-2 border-brand-olive/10 p-6">
              <p class="font-sans text-brand-olive/60 text-xs uppercase tracking-wide mb-2">Completados este mes</p>
              <p class="font-sans text-brand-primary text-3xl font-bold">{{ stats.completedThisMonth }}</p>
              <p class="font-sans text-xs text-brand-olive/40 mt-1">Entregados en {{ currentMonthName }}</p>
            </div>

            <div class="bg-white border-2 border-brand-olive/10 p-6">
              <p class="font-sans text-brand-olive/60 text-xs uppercase tracking-wide mb-2">Ingresos potenciales</p>
              <p class="font-sans text-brand-primary text-2xl font-bold">{{ stats.potentialRevenue }}</p>
              <p class="font-sans text-xs text-brand-olive/40 mt-1">Confirmados y pagados pendientes de cobro</p>
            </div>
          </div>
        </div>

        <!-- Gestion -->
        <div>
          <h3 class="font-sans text-sm text-brand-olive/50 uppercase tracking-wide mb-3">Gestion</h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
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
          </div>
        </div>
      </template>
    </NuxtLayout>
  </div>
</template>

<script setup>
import { formatPrice } from '~/utils/format'

const { get } = useApi()

const spanishMonths = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]
const currentMonthName = computed(() => spanishMonths[new Date().getMonth()])

const loading = ref(true)
const stats = ref({
  products: 0,
  categories: 0,
  totalOrders: 0,
  newOrders: 0,
  inProcess: 0,
  completedThisMonth: 0,
  potentialRevenue: '$0',
  activePromoCodes: 0,
  subscribers: 0,
})

onMounted(async () => {
  try {
    const [products, categories, orders, promoCodes, subscribers] = await Promise.all([
      get('/api/products/all'),
      get('/api/categories/all'),
      get('/api/orders').catch(() => []),
      get('/api/promocodes').catch(() => []),
      get('/api/subscribe').catch(() => []),
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
      activePromoCodes: (promoCodes || []).filter(p => p.isActive).length,
      subscribers: (subscribers || []).length,
    }
  } catch (error) {
    console.error('Error loading stats:', error)
  } finally {
    loading.value = false
  }
})
</script>
