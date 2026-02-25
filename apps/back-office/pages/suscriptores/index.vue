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

      <!-- Metrics -->
      <div v-if="!loading && subscribers.length > 0" class="grid grid-cols-3 gap-4 mb-6">
        <div class="bg-white border-2 border-brand-olive/10 p-4">
          <p class="font-sans text-brand-olive/60 text-xs uppercase tracking-wide mb-1">Total suscriptores</p>
          <p class="font-sans text-brand-primary text-2xl font-bold">{{ subscribers.length }}</p>
        </div>
        <div class="bg-white border-2 border-brand-olive/10 p-4">
          <p class="font-sans text-brand-olive/60 text-xs uppercase tracking-wide mb-1">Contactados</p>
          <p class="font-sans text-brand-primary text-2xl font-bold">{{ contactedCount }}</p>
        </div>
        <div class="bg-white border-2 border-brand-olive/10 p-4">
          <p class="font-sans text-brand-olive/60 text-xs uppercase tracking-wide mb-1">Usaron codigo</p>
          <p class="font-sans text-brand-primary text-2xl font-bold">{{ usedCodeCount }}</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-col sm:flex-row gap-3 mb-6">
        <!-- Search -->
        <div class="flex-1">
          <input
            v-model="search"
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
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

        <!-- Contacted filter -->
        <select
          v-model="contactedFilter"
          class="px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
        >
          <option value="">Todos</option>
          <option value="contacted">Contactados</option>
          <option value="not_contacted">Sin contactar</option>
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

      <!-- Bulk action bar -->
      <div
        v-if="selectedIds.size > 0"
        class="flex items-center gap-4 mb-4 p-3 bg-brand-primary/5 border-2 border-brand-primary/20"
      >
        <span class="font-sans text-sm text-brand-olive font-medium">
          {{ selectedIds.size }} suscriptor{{ selectedIds.size > 1 ? 'es' : '' }} seleccionado{{ selectedIds.size > 1 ? 's' : '' }}
        </span>
        <button
          @click="selectedIds.clear()"
          class="px-3 py-1 font-sans text-xs text-brand-olive border-2 border-brand-olive/20 hover:border-brand-olive/40 transition-colors"
        >
          Deseleccionar
        </button>
        <button
          @click="openBulkContactModal"
          class="px-3 py-1 font-sans text-xs text-white bg-brand-primary hover:bg-brand-primary/90 transition-colors"
        >
          Marcar como contactados
        </button>
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
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b-2 border-brand-olive/10">
                <th class="pb-3 pr-2">
                  <input
                    type="checkbox"
                    :checked="allPageSelected"
                    @change="togglePageSelection"
                    class="accent-brand-primary"
                  />
                </th>
                <th class="text-left font-sans text-xs text-brand-olive/50 uppercase tracking-wide pb-3 pr-4">Nombre / Razón Social</th>
                <th class="text-left font-sans text-xs text-brand-olive/50 uppercase tracking-wide pb-3 pr-4">Contacto</th>
                <th class="text-left font-sans text-xs text-brand-olive/50 uppercase tracking-wide pb-3 pr-4">Origen</th>
                <th class="text-left font-sans text-xs text-brand-olive/50 uppercase tracking-wide pb-3 pr-4">Fecha</th>
                <th class="text-left font-sans text-xs text-brand-olive/50 uppercase tracking-wide pb-3 pr-4">Contactado</th>
                <th class="text-left font-sans text-xs text-brand-olive/50 uppercase tracking-wide pb-3 pr-4">Codigo enviado</th>
                <th class="text-left font-sans text-xs text-brand-olive/50 uppercase tracking-wide pb-3 pr-4">Codigo usado</th>
                <th class="text-left font-sans text-xs text-brand-olive/50 uppercase tracking-wide pb-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="sub in paginatedSubscribers"
                :key="sub.id"
                class="border-b border-brand-olive/5"
              >
                <td class="py-3 pr-2">
                  <input
                    type="checkbox"
                    :checked="selectedIds.has(sub.id)"
                    @change="toggleSelection(sub.id)"
                    class="accent-brand-primary"
                  />
                </td>
                <td class="py-3 pr-4 font-sans text-sm text-brand-olive">{{ sub.nombreRazonSocial || sub.nombre || '—' }}</td>
                <td class="py-3 pr-4 font-sans text-sm text-brand-olive/70">
                  <span v-if="sub.email">{{ sub.email }}</span>
                  <span v-else-if="sub.telefono">{{ sub.telefono }}</span>
                  <span v-else>—</span>
                  <span v-if="sub.contactType" class="ml-1 font-sans text-[10px] uppercase text-brand-olive/40">{{ sub.contactType === 'telefono' ? 'Tel' : 'Email' }}</span>
                </td>
                <td class="py-3 pr-4 font-sans text-sm text-brand-olive/70">{{ sub.source || '—' }}</td>
                <td class="py-3 pr-4 font-sans text-sm text-brand-olive/70">{{ formatDate(sub.createdAt) }}</td>
                <td class="py-3 pr-4">
                  <span v-if="sub.lastContactedAt" class="inline-flex items-center gap-1 font-sans text-xs text-green-700 bg-green-50 px-2 py-0.5 border border-green-200">
                    Si · {{ formatDate(sub.lastContactedAt) }}
                  </span>
                  <span v-else class="font-sans text-xs text-brand-olive/40">No</span>
                </td>
                <td class="py-3 pr-4 font-sans text-xs text-brand-olive/70">{{ getLastPromoSent(sub) || '—' }}</td>
                <td class="py-3 pr-4 font-sans text-xs text-brand-olive/70">{{ getPromoUsed(sub.email) || '—' }}</td>
                <td class="py-3">
                  <button
                    @click="openSingleContactModal(sub)"
                    class="px-3 py-1 font-sans text-xs text-brand-primary border border-brand-primary/30 hover:bg-brand-primary/5 transition-colors"
                  >
                    Contactar
                  </button>
                </td>
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
            <div class="flex items-start gap-3 mb-2">
              <input
                type="checkbox"
                :checked="selectedIds.has(sub.id)"
                @change="toggleSelection(sub.id)"
                class="accent-brand-primary mt-1"
              />
              <div class="flex-1 min-w-0">
                <p class="font-sans text-sm text-brand-olive truncate">{{ sub.nombreRazonSocial || sub.nombre || '—' }}</p>
                <p class="font-sans text-xs text-brand-olive/60 mt-0.5 truncate">{{ sub.email || sub.telefono || '—' }}<span v-if="sub.contactType" class="ml-1 uppercase text-brand-olive/40">{{ sub.contactType === 'telefono' ? '(Tel)' : '(Email)' }}</span></p>
                <div class="flex items-center gap-2 mt-1">
                  <span class="font-sans text-xs text-brand-olive/50 px-2 py-0.5 border border-brand-olive/10 bg-brand-olive/5">{{ sub.source || '—' }}</span>
                  <span class="font-sans text-xs text-brand-olive/50">{{ formatDate(sub.createdAt) }}</span>
                </div>
              </div>
            </div>
            <div class="flex items-center justify-between mt-3 pt-3 border-t border-brand-olive/5">
              <div>
                <span v-if="sub.lastContactedAt" class="inline-flex items-center gap-1 font-sans text-xs text-green-700 bg-green-50 px-2 py-0.5 border border-green-200">
                  Contactado · {{ formatDate(sub.lastContactedAt) }}
                </span>
                <span v-else class="font-sans text-xs text-brand-olive/40">Sin contactar</span>
              </div>
              <button
                @click="openSingleContactModal(sub)"
                class="px-3 py-1 font-sans text-xs text-brand-primary border border-brand-primary/30 hover:bg-brand-primary/5 transition-colors"
              >
                Contactar
              </button>
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

      <!-- Contact Modal -->
      <AdminContactModal
        :visible="showContactModal"
        :subscriber-count="contactModalCount"
        :subscriber-email="contactModalEmail"
        :promo-codes="activePromoCodes"
        @confirm="handleContact"
        @cancel="showContactModal = false"
      />
    </NuxtLayout>
  </div>
</template>

<script setup>
const { get, patch, post } = useApi()

const subscribers = ref([])
const promoCodes = ref([])
const loading = ref(true)
const search = ref('')
const originFilter = ref('')
const contactedFilter = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const sortBy = ref('newest')
const currentPage = ref(1)
const perPage = 25

// Selection
const selectedIds = ref(new Set())

// Contact modal
const showContactModal = ref(false)
const contactModalCount = ref(1)
const contactModalEmail = ref('')
const contactTarget = ref(null) // null = bulk, string = single subscriber id

// Extract unique origins from loaded data
const availableOrigins = computed(() => {
  const origins = new Set()
  subscribers.value.forEach(s => {
    if (s.source) origins.add(s.source)
  })
  return [...origins].sort()
})

// Active promo codes for the modal dropdown
const activePromoCodes = computed(() => {
  return promoCodes.value.filter(p => p.isActive)
})

// Build a map of email → [{code, usedAt}] from promo code usedBy arrays
const promoCodeUsageMap = computed(() => {
  const map = new Map()
  for (const promo of promoCodes.value) {
    if (!promo.usedBy) continue
    for (const usage of promo.usedBy) {
      if (!usage.email) continue
      const email = usage.email.toLowerCase()
      if (!map.has(email)) map.set(email, [])
      map.get(email).push({ code: promo.code, usedAt: usage.usedAt })
    }
  }
  return map
})

// Metrics
const contactedCount = computed(() => {
  return subscribers.value.filter(s => s.lastContactedAt).length
})

const usedCodeCount = computed(() => {
  return subscribers.value.filter(s => s.email && promoCodeUsageMap.value.has(s.email.toLowerCase())).length
})

// Reset page when any filter changes
watch([search, originFilter, contactedFilter, dateFrom, dateTo, sortBy], () => {
  currentPage.value = 1
})

const filteredSubscribers = computed(() => {
  let result = [...subscribers.value]

  // Filter by origin
  if (originFilter.value) {
    result = result.filter(s => s.source === originFilter.value)
  }

  // Filter by contacted status
  if (contactedFilter.value === 'contacted') {
    result = result.filter(s => s.lastContactedAt)
  } else if (contactedFilter.value === 'not_contacted') {
    result = result.filter(s => !s.lastContactedAt)
  }

  // Filter by search
  if (search.value.trim()) {
    const q = search.value.toLowerCase().trim()
    result = result.filter(s =>
      (s.email && s.email.toLowerCase().includes(q)) ||
      (s.telefono && s.telefono.toLowerCase().includes(q)) ||
      (s.nombreRazonSocial && s.nombreRazonSocial.toLowerCase().includes(q)) ||
      (s.nombre && s.nombre.toLowerCase().includes(q)) ||
      (s.empresa && s.empresa.toLowerCase().includes(q))
    )
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

// Check if all items on current page are selected
const allPageSelected = computed(() => {
  if (paginatedSubscribers.value.length === 0) return false
  return paginatedSubscribers.value.every(s => selectedIds.value.has(s.id))
})

function togglePageSelection() {
  if (allPageSelected.value) {
    paginatedSubscribers.value.forEach(s => selectedIds.value.delete(s.id))
  } else {
    paginatedSubscribers.value.forEach(s => selectedIds.value.add(s.id))
  }
}

function toggleSelection(id) {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id)
  } else {
    selectedIds.value.add(id)
  }
}

// Contact modal handlers
function openSingleContactModal(sub) {
  contactTarget.value = sub.id
  contactModalCount.value = 1
  contactModalEmail.value = sub.email || sub.telefono || ''
  showContactModal.value = true
}

function openBulkContactModal() {
  contactTarget.value = null
  contactModalCount.value = selectedIds.value.size
  contactModalEmail.value = ''
  showContactModal.value = true
}

async function handleContact(data) {
  showContactModal.value = false
  try {
    if (contactTarget.value) {
      // Single subscriber
      const updated = await patch(`/api/subscribe/${contactTarget.value}/contact`, data)
      const idx = subscribers.value.findIndex(s => s.id === updated.id)
      if (idx !== -1) subscribers.value[idx] = updated
    } else {
      // Bulk
      const ids = [...selectedIds.value]
      await post('/api/subscribe/bulk-contact', { subscriberIds: ids, ...data })
      // Refresh all subscribers to get updated data
      subscribers.value = await get('/api/subscribe')
      selectedIds.value.clear()
    }
  } catch (error) {
    console.error('Error marking as contacted:', error)
  }
}

// Helpers
function getLastPromoSent(sub) {
  if (!sub.communications || sub.communications.length === 0) return null
  // Find last communication that has a promo code
  for (let i = sub.communications.length - 1; i >= 0; i--) {
    if (sub.communications[i].promoCodeSent) return sub.communications[i].promoCodeSent
  }
  return null
}

function getPromoUsed(email) {
  if (!email) return null
  const usages = promoCodeUsageMap.value.get(email.toLowerCase())
  if (!usages || usages.length === 0) return null
  return usages.map(u => u.code).join(', ')
}

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
  const header = 'Nombre/Razon Social,Contacto,Tipo Contacto,Origen,Fecha,Contactado,Ultimo contacto,Codigo enviado,Codigo usado'
  const rows = filteredSubscribers.value.map(s => {
    const name = s.nombreRazonSocial || s.nombre || ''
    const contact = s.email || s.telefono || ''
    const contactType = s.contactType || (s.email ? 'email' : '')
    const date = formatDate(s.createdAt)
    const contacted = s.lastContactedAt ? 'Si' : 'No'
    const lastContact = s.lastContactedAt ? formatDate(s.lastContactedAt) : ''
    const promoSent = getLastPromoSent(s) || ''
    const promoUsed = getPromoUsed(s.email) || ''
    return `${name},${contact},${contactType},${s.source || ''},${date},${contacted},${lastContact},${promoSent},${promoUsed}`
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
    const [subsData, promoData] = await Promise.all([
      get('/api/subscribe'),
      get('/api/promocodes'),
    ])
    subscribers.value = subsData
    promoCodes.value = promoData
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    loading.value = false
  }
})
</script>
