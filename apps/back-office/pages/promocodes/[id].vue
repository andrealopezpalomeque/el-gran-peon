<template>
  <div>
    <NuxtLayout name="admin">
      <div class="flex items-center justify-between mb-6">
        <h2 class="font-sans text-brand-olive text-2xl font-semibold">Editar Codigo Promocional</h2>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <p class="font-sans text-brand-olive/60 text-sm">Cargando...</p>
      </div>

      <div v-else class="max-w-2xl">
        <form @submit.prevent="handleSubmit">
          <!-- Code -->
          <div class="mb-5">
            <label class="block font-sans text-sm text-brand-olive/70 mb-1">Codigo *</label>
            <input
              v-model="form.code"
              type="text"
              required
              class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive uppercase focus:outline-none focus:border-brand-primary transition-colors"
            />
          </div>

          <!-- Description -->
          <div class="mb-5">
            <label class="block font-sans text-sm text-brand-olive/70 mb-1">Descripcion</label>
            <input
              v-model="form.description"
              type="text"
              class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
            />
          </div>

          <!-- Discount percent -->
          <div class="mb-5">
            <label class="block font-sans text-sm text-brand-olive/70 mb-1">Porcentaje de descuento *</label>
            <div class="flex items-center gap-2">
              <input
                v-model.number="form.discountPercent"
                type="number"
                required
                min="1"
                max="100"
                class="w-32 px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
              />
              <span class="font-sans text-sm text-brand-olive/60">%</span>
            </div>
          </div>

          <!-- Max uses global -->
          <div class="mb-5">
            <label class="block font-sans text-sm text-brand-olive/70 mb-1">Usos maximos (global)</label>
            <input
              v-model.number="form.maxUses"
              type="number"
              min="0"
              class="w-32 px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
            />
            <p class="font-sans text-xs text-brand-olive/40 mt-1">0 = sin limite</p>
          </div>

          <!-- Max uses per customer -->
          <div class="mb-5">
            <label class="block font-sans text-sm text-brand-olive/70 mb-1">Usos maximos por cliente</label>
            <input
              v-model.number="form.maxUsesPerCustomer"
              type="number"
              min="0"
              class="w-32 px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
            />
            <p class="font-sans text-xs text-brand-olive/40 mt-1">0 = sin limite por cliente</p>
          </div>

          <!-- Expiry date -->
          <div class="mb-5">
            <label class="block font-sans text-sm text-brand-olive/70 mb-1">Fecha de vencimiento</label>
            <input
              v-model="form.expiresAt"
              type="date"
              class="w-64 px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
            />
            <p class="font-sans text-xs text-brand-olive/40 mt-1">Dejar vacio para sin vencimiento</p>
          </div>

          <!-- Active -->
          <div class="mb-8">
            <label class="flex items-center gap-3 cursor-pointer">
              <input
                v-model="form.isActive"
                type="checkbox"
                class="w-4 h-4 accent-brand-primary"
              />
              <span class="font-sans text-sm text-brand-olive">Activo</span>
            </label>
          </div>

          <!-- Actions -->
          <div class="flex gap-3">
            <button
              type="submit"
              :disabled="saving"
              class="px-6 py-2 bg-brand-primary text-brand-cream font-sans text-sm font-medium hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
            >
              {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
            <NuxtLink
              to="/promocodes"
              class="px-6 py-2 font-sans text-sm text-brand-olive border-2 border-brand-olive/20 hover:border-brand-olive/40 transition-colors"
            >
              Cancelar
            </NuxtLink>
          </div>

          <p v-if="error" class="mt-4 font-sans text-red-600 text-sm">{{ error }}</p>
        </form>

        <!-- Usage info (read-only) -->
        <div class="mt-10 pt-8 border-t-2 border-brand-olive/10">
          <h3 class="font-sans text-brand-olive text-lg font-semibold mb-4">Informacion de uso</h3>

          <div class="mb-4">
            <span class="font-sans text-sm text-brand-olive/70">Total de usos: </span>
            <span class="font-sans text-sm font-semibold text-brand-olive">{{ usageData.currentUses || 0 }}</span>
          </div>

          <div v-if="usageData.usedBy && usageData.usedBy.length > 0">
            <p class="font-sans text-sm text-brand-olive/70 mb-2">Emails que usaron este codigo:</p>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-brand-olive/10">
                    <th class="text-left font-sans text-xs text-brand-olive/50 pb-2 pr-4">Email</th>
                    <th class="text-left font-sans text-xs text-brand-olive/50 pb-2">Fecha de uso</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(usage, idx) in usageData.usedBy"
                    :key="idx"
                    class="border-b border-brand-olive/5"
                  >
                    <td class="py-2 pr-4 font-sans text-sm text-brand-olive">{{ usage.email || '—' }}</td>
                    <td class="py-2 font-sans text-sm text-brand-olive/70">{{ formatDate(usage.usedAt) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <p v-else class="font-sans text-sm text-brand-olive/50">Este codigo aun no fue utilizado.</p>
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()
const { get, put } = useApi()

const loading = ref(true)
const saving = ref(false)
const error = ref('')

const form = ref({
  code: '',
  description: '',
  discountPercent: 10,
  maxUses: 0,
  maxUsesPerCustomer: 0,
  expiresAt: '',
  isActive: true,
})

const usageData = ref({
  currentUses: 0,
  usedBy: [],
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
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${hours}:${minutes}`
}

function toDateInputValue(date) {
  if (!date) return ''
  const ms = toTimestamp(date)
  const d = new Date(ms)
  return d.toISOString().split('T')[0]
}

onMounted(async () => {
  try {
    const promo = await get(`/api/promocodes/${route.params.id}`)

    form.value = {
      code: promo.code || '',
      description: promo.description || '',
      discountPercent: promo.discountPercent || 10,
      maxUses: promo.maxUses ?? 0,
      maxUsesPerCustomer: promo.maxUsesPerCustomer ?? 0,
      expiresAt: toDateInputValue(promo.expiresAt),
      isActive: promo.isActive ?? true,
    }

    usageData.value = {
      currentUses: promo.currentUses || 0,
      usedBy: promo.usedBy || [],
    }
  } catch (err) {
    error.value = 'Error al cargar el codigo promocional'
    console.error(err)
  } finally {
    loading.value = false
  }
})

async function handleSubmit() {
  saving.value = true
  error.value = ''

  try {
    const data = {
      code: form.value.code,
      description: form.value.description,
      discountPercent: form.value.discountPercent,
      maxUses: form.value.maxUses,
      maxUsesPerCustomer: form.value.maxUsesPerCustomer,
      expiresAt: form.value.expiresAt || null,
      isActive: form.value.isActive,
    }
    await put(`/api/promocodes/${route.params.id}`, data)
    router.push('/promocodes')
  } catch (err) {
    error.value = err.message || 'Error al actualizar el codigo promocional'
  } finally {
    saving.value = false
  }
}
</script>
