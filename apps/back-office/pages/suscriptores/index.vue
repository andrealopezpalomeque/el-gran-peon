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

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <p class="font-sans text-brand-olive/60 text-sm">Cargando suscriptores...</p>
      </div>

      <!-- Empty state -->
      <div v-else-if="subscribers.length === 0" class="text-center py-12">
        <p class="font-sans text-brand-olive/60 text-sm">No hay suscriptores registrados.</p>
      </div>

      <template v-else>
        <!-- Search -->
        <div class="mb-6">
          <input
            v-model="search"
            type="text"
            placeholder="Buscar por email..."
            class="w-full max-w-md px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
          />
        </div>

        <!-- Count -->
        <p class="font-sans text-xs text-brand-olive/50 mb-3">
          {{ filteredSubscribers.length }} de {{ subscribers.length }} suscriptores
        </p>

        <!-- Table -->
        <div class="overflow-x-auto">
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
                v-for="sub in filteredSubscribers"
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
      </template>
    </NuxtLayout>
  </div>
</template>

<script setup>
const { get } = useApi()

const subscribers = ref([])
const loading = ref(true)
const search = ref('')

const filteredSubscribers = computed(() => {
  if (!search.value.trim()) return subscribers.value
  const q = search.value.toLowerCase().trim()
  return subscribers.value.filter(s => s.email.toLowerCase().includes(q))
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
  const rows = subscribers.value.map(s => {
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
