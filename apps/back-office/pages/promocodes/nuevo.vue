<template>
  <div>
    <NuxtLayout name="admin">
      <div class="flex items-center justify-between mb-6">
        <h2 class="font-sans text-brand-olive text-2xl font-semibold">Nuevo Codigo Promocional</h2>
      </div>

      <form @submit.prevent="handleSubmit" class="max-w-2xl">
        <!-- Code -->
        <div class="mb-5">
          <label class="block font-sans text-sm text-brand-olive/70 mb-1">Codigo *</label>
          <input
            v-model="form.code"
            type="text"
            required
            class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive uppercase focus:outline-none focus:border-brand-primary transition-colors"
            placeholder="BIENVENIDO20"
          />
          <p class="font-sans text-xs text-brand-olive/40 mt-1">Se convertira automaticamente a mayusculas</p>
        </div>

        <!-- Description -->
        <div class="mb-5">
          <label class="block font-sans text-sm text-brand-olive/70 mb-1">Descripcion</label>
          <input
            v-model="form.description"
            type="text"
            class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
            placeholder="Codigo de bienvenida para suscriptores"
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
            {{ saving ? 'Guardando...' : 'Guardar' }}
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
    </NuxtLayout>
  </div>
</template>

<script setup>
const { post } = useApi()
const router = useRouter()

const saving = ref(false)
const error = ref('')

const form = ref({
  code: '',
  description: '',
  discountPercent: 10,
  maxUses: 0,
  maxUsesPerCustomer: 1,
  expiresAt: '',
  isActive: true,
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
    await post('/api/promocodes', data)
    router.push('/promocodes')
  } catch (err) {
    error.value = err.message || 'Error al crear el codigo promocional'
  } finally {
    saving.value = false
  }
}
</script>
