<template>
  <div>
    <NuxtLayout name="admin">
      <div class="flex items-center justify-between mb-6">
        <h2 class="font-sans text-brand-olive text-2xl font-semibold">Suscriptores</h2>
        <button
          v-if="subscribers.length > 0"
          @click="exportCSV"
          class="px-5 py-2 bg-brand-primary text-brand-cream font-sans text-sm font-medium hover:bg-brand-primary/90 transition-colors"
        >
          Exportar CSV
        </button>
      </div>

      <!-- Filters -->
      <div class="flex flex-col sm:flex-row gap-3 mb-6">
        <!-- Search -->
        <div class="flex-1">
          <input
            v-model="search"
            type="text"
            placeholder="Buscar por email..."
            class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
          />
        </div>

        <!-- Origin filter -->
        <select
          v-model="originFilter"
          class="px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
        >
          <option value="">Todos los origenes</option>
          <option v-for="origin in availableOrigins" :key="origin" :value="origin">{{ origin }}</option>
        </select>

        <!-- Date from -->
        <input
          v-model="dateFrom"
          type="date"
          placeholder="Desde"
          title="Desde"
          class="px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
        />

        <!-- Date to -->
        <input
          v-model="dateTo"
          type="date"
          placeholder="Hasta"
          title="Hasta"
          class="px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
        />

        <!-- Sort -->
        <select
          v-model="sortBy"
          class="px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
        >
          <option value="newest">Mas recientes</option>
          <option value="oldest">Mas antiguos</option>
        </select>
      </div>

      <!-- Loading skeleton -->
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 5" :key="i" class="bg-white border-2 border-brand-olive/10 p-4 animate-pulse">
          <div class="flex gap-4">
            <div class="h-4 w-48 bg-brand-olive/5" />
            <div class="h-4 w-24 bg-brand-olive/5" />
            <div class="h-4 w-20 bg-brand-olive/5" />
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="filteredSubscribers.length === 0" class="bg-white border-2 border-brand-olive/10 p-12 text-center">
        <p class="font-sans text-brand-olive/60 text-sm">
          {{ subscribers.length === 0 ? 'No hay suscriptores registrados.' : 'No se encontraron suscriptores con esos filtros.' }}
        </p>
      </div>

      <template v-else>
        <!-- Count -->
        <p class="font-sans text-xs text-brand-olive/50 mb-3">
          Mostrando {{ paginationStart }}-{{ paginationEnd }} de {{ filteredSubscribers.length }} suscriptores
        </p>

        <!-- Desktop table -->
        <div class="hidden md:block">
          <table class="w-full">
            <thead>
              <tr class="border-b-2 border-brand-olive/10">
                <th class="text-left font-sans text-xs text-brand-olive/50 uppercase tracking-wide pb-3 pr-4">Email</th>
                <th class="text-left font-sans text-xs text-brand-olive/50 uppercase tracking-wide pb-3 pr-4">Origen</th>
                <th class="text-left font-sans text-xs text-brand-olive/50 uppercase tracking-wide pb-3">Fecha</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="sub in paginatedSubscribers"
                :key="sub.id"
                class="border-b border-brand-olive/5"
              >
                <td class="py-3 pr-4 font-sans text-sm text-brand-olive">{{ sub.email }}</td>
                <td class="py-3 pr-4 font-sans text-sm text-brand-olive/70">{{ sub.source || '—' }}</td>
                <td class="py-3 font-sans text-sm text-brand-olive/70">{{ formatDate(sub.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile cards -->
        <div class="md:hidden space-y-3">
          <div
            v-for="sub in paginatedSubscribers"
            :key="sub.id"
            class="bg-white border-2 border-brand-olive/10 p-4"
          >
            <p class="font-sans text-sm text-brand-olive mb-2">{{ sub.email }}</p>
            <div class="flex items-center justify-between">
              <span class="font-sans text-xs text-brand-olive/50 px-2 py-0.5 border border-brand-olive/10 bg-brand-olive/5">{{ sub.source || '—' }}</span>
              <span class="font-sans text-xs text-brand-olive/50">{{ formatDate(sub.createdAt) }}</span>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-between mt-6 pt-4 border-t border-brand-olive/10">
          <button
            :disabled="currentPage === 1"
            @click="currentPage--"
            class="px-4 py-2 font-sans text-sm border-2 transition-colors"
            :class="currentPage === 1 ? 'border-brand-olive/10 text-brand-olive/30 cursor-not-allowed' : 'border-brand-olive/20 text-brand-olive hover:border-brand-primary hover:text-brand-primary'"
          >
            Anterior
          </button>
          <span class="font-sans text-sm text-brand-olive/60">
            Pagina {{ currentPage }} de {{ totalPages }}
          </span>
          <button
            :disabled="currentPage === totalPages"
            @click="currentPage++"
            class="px-4 py-2 font-sans text-sm border-2 transition-colors"
            :class="currentPage === totalPages ? 'border-brand-olive/10 text-brand-olive/30 cursor-not-allowed' : 'border-brand-olive/20 text-brand-olive hover:border-brand-primary hover:text-brand-primary'"
          >
            Siguiente
          </button>
        </div>
      </template>
    </NuxtLayout>
  </div>
</template>

<script setup>
const { get } = useApi()

const subscribers = ref([])
const loading = ref(true)
const search = ref('')
const originFilter = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const sortBy = ref('newest')
const currentPage = ref(1)
const perPage = 25

// Extract unique origins from loaded data
const availableOrigins = computed(() => {
  const origins = new Set()
  subscribers.value.forEach(s => {
    if (s.source) origins.add(s.source)
  })
  return [...origins].sort()
})

// Reset page when any filter changes
watch([search, originFilter, dateFrom, dateTo, sortBy], () => {
  currentPage.value = 1
})

const filteredSubscribers = computed(() => {
  let result = [...subscribers.value]

  // Filter by origin
  if (originFilter.value) {
    result = result.filter(s => s.source === originFilter.value)
  }

  // Filter by search
  if (search.value.trim()) {
    const q = search.value.toLowerCase().trim()
    result = result.filter(s => s.email.toLowerCase().includes(q))
  }

  // Filter by date range
  if (dateFrom.value) {
    const from = new Date(dateFrom.value).getTime()
    result = result.filter(s => toTimestamp(s.createdAt) >= from)
  }
  if (dateTo.value) {
    const to = new Date(dateTo.value).getTime() + 86400000 - 1 // end of day
    result = result.filter(s => toTimestamp(s.createdAt) <= to)
  }

  // Sort
  if (sortBy.value === 'oldest') {
    result.sort((a, b) => toTimestamp(a.createdAt) - toTimestamp(b.createdAt))
  } else {
    result.sort((a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt))
  }

  return result
})

// Pagination
const totalPages = computed(() => Math.max(1, Math.ceil(filteredSubscribers.value.length / perPage)))
const paginationStart = computed(() => (currentPage.value - 1) * perPage + 1)
const paginationEnd = computed(() => Math.min(currentPage.value * perPage, filteredSubscribers.value.length))
const paginatedSubscribers = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredSubscribers.value.slice(start, start + perPage)
})

function toTimestamp(date) {
  if (!date) return 0
  if (date._seconds) return date._seconds * 1000
  if (date.seconds) return date.seconds * 1000
  return new Date(date).getTime()
}

function formatDate(date) {
  if (!date) return ''
  const ms = toTimestamp(date)
  const d = new Date(ms)
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
}

function exportCSV() {
  const header = 'Email,Origen,Fecha'
  const rows = filteredSubscribers.value.map(s => {
    const date = formatDate(s.createdAt)
    return `${s.email},${s.source || ''},${date}`
  })
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `suscriptores_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

onMounted(async () => {
  try {
    subscribers.value = await get('/api/subscribe')
  } catch (error) {
    console.error('Error loading subscribers:', error)
  } finally {
    loading.value = false
  }
})
</script>
