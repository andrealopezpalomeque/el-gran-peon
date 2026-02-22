<template>
  <div>
    <NuxtLayout name="admin">
      <div class="flex items-center justify-between mb-6">
        <h2 class="font-sans text-brand-olive text-2xl font-semibold">Codigos Promocionales</h2>
        <NuxtLink
          to="/promocodes/nuevo"
          class="px-5 py-2 bg-brand-primary text-brand-cream font-sans text-sm font-medium hover:bg-brand-primary/90 transition-colors"
        >
          Nuevo Codigo
        </NuxtLink>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <p class="font-sans text-brand-olive/60 text-sm">Cargando codigos...</p>
      </div>

      <!-- Empty state -->
      <div v-else-if="promoCodes.length === 0" class="text-center py-12">
        <p class="font-sans text-brand-olive/60 text-sm">No hay codigos promocionales creados.</p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b-2 border-brand-olive/10">
              <th class="text-left font-sans text-xs text-brand-olive/50 uppercase tracking-wide pb-3 pr-4">Codigo</th>
              <th class="text-left font-sans text-xs text-brand-olive/50 uppercase tracking-wide pb-3 pr-4">Descuento</th>
              <th class="text-left font-sans text-xs text-brand-olive/50 uppercase tracking-wide pb-3 pr-4">Usos</th>
              <th class="text-left font-sans text-xs text-brand-olive/50 uppercase tracking-wide pb-3 pr-4">Vencimiento</th>
              <th class="text-left font-sans text-xs text-brand-olive/50 uppercase tracking-wide pb-3 pr-4">Estado</th>
              <th class="text-right font-sans text-xs text-brand-olive/50 uppercase tracking-wide pb-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="promo in promoCodes"
              :key="promo.id"
              class="border-b border-brand-olive/5"
            >
              <td class="py-3 pr-4">
                <span class="font-sans text-sm font-semibold text-brand-olive">{{ promo.code }}</span>
                <span v-if="promo.description" class="block font-sans text-xs text-brand-olive/50">{{ promo.description }}</span>
              </td>
              <td class="py-3 pr-4">
                <span class="font-sans text-sm text-brand-primary font-medium">{{ promo.discountPercent }}%</span>
              </td>
              <td class="py-3 pr-4">
                <span class="font-sans text-sm text-brand-olive">
                  {{ promo.currentUses || 0 }}{{ promo.maxUses > 0 ? ` / ${promo.maxUses}` : '' }}
                </span>
              </td>
              <td class="py-3 pr-4">
                <span class="font-sans text-sm text-brand-olive/70">
                  {{ promo.expiresAt ? formatDate(promo.expiresAt) : 'Sin vencimiento' }}
                </span>
                <span v-if="isExpired(promo.expiresAt)" class="block font-sans text-xs text-red-500">Expirado</span>
              </td>
              <td class="py-3 pr-4">
                <AdminStatusBadge :status="promo.isActive" type="active" />
              </td>
              <td class="py-3 text-right">
                <div class="flex items-center justify-end gap-2">
                  <NuxtLink
                    :to="`/promocodes/${promo.id}`"
                    class="px-3 py-1 font-sans text-xs text-brand-primary border border-brand-primary/30 hover:bg-brand-primary hover:text-brand-cream transition-colors"
                  >
                    Editar
                  </NuxtLink>
                  <button
                    @click="confirmDelete(promo)"
                    class="px-3 py-1 font-sans text-xs text-red-700 border border-red-300 hover:bg-red-700 hover:text-white transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <AdminConfirmModal
        :visible="showDeleteModal"
        title="Eliminar codigo promocional"
        :message="deleteMessage"
        @confirm="deletePromo"
        @cancel="showDeleteModal = false"
      />
    </NuxtLayout>
  </div>
</template>

<script setup>
const { get, delete: apiDelete } = useApi()

const promoCodes = ref([])
const loading = ref(true)
const showDeleteModal = ref(false)
const promoToDelete = ref(null)

const deleteMessage = computed(() => {
  if (!promoToDelete.value) return ''
  return `Se eliminara el codigo '${promoToDelete.value.code}'. Esta accion no se puede deshacer.`
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

function isExpired(expiresAt) {
  if (!expiresAt) return false
  return toTimestamp(expiresAt) < Date.now()
}

async function loadPromoCodes() {
  loading.value = true
  try {
    promoCodes.value = await get('/api/promocodes')
  } catch (error) {
    console.error('Error loading promo codes:', error)
  } finally {
    loading.value = false
  }
}

function confirmDelete(promo) {
  promoToDelete.value = promo
  showDeleteModal.value = true
}

async function deletePromo() {
  if (!promoToDelete.value) return

  try {
    await apiDelete(`/api/promocodes/${promoToDelete.value.id}`)
    await loadPromoCodes()
  } catch (error) {
    console.error('Error deleting promo code:', error)
    alert(error.message || 'Error al eliminar el codigo')
  } finally {
    showDeleteModal.value = false
    promoToDelete.value = null
  }
}

onMounted(loadPromoCodes)
</script>
