<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center"
    >
      <!-- Overlay -->
      <div class="absolute inset-0 bg-black/50" @click="cancel" />

      <!-- Modal -->
      <div class="relative bg-white border-2 border-brand-olive/20 p-8 max-w-md w-full mx-4">
        <h3 class="font-sans text-brand-olive text-lg font-semibold mb-2">Marcar como contactado</h3>
        <p class="font-sans text-brand-olive/70 text-sm mb-6">
          {{ subscriberCount > 1 ? `${subscriberCount} suscriptores seleccionados` : subscriberEmail }}
        </p>

        <div class="space-y-4">
          <!-- Canal -->
          <div>
            <label class="block font-sans text-sm text-brand-olive/70 mb-1">Canal *</label>
            <select
              v-model="form.channel"
              class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
            >
              <option value="">Seleccionar canal</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>

          <!-- Codigo promocional -->
          <div>
            <label class="block font-sans text-sm text-brand-olive/70 mb-1">Codigo promocional</label>
            <select
              v-model="selectedPromoCode"
              class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
            >
              <option value="">Sin codigo</option>
              <option v-for="promo in promoCodes" :key="promo.id" :value="promo.id">
                {{ promo.code }} ({{ promo.discountPercent }}%)
              </option>
            </select>
          </div>

          <!-- Fecha de contacto -->
          <div>
            <label class="block font-sans text-sm text-brand-olive/70 mb-1">Fecha de contacto</label>
            <input
              v-model="form.contactedAt"
              type="date"
              class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
            />
          </div>

          <!-- Nota -->
          <div>
            <label class="block font-sans text-sm text-brand-olive/70 mb-1">Nota</label>
            <input
              v-model="form.note"
              type="text"
              placeholder="Nota opcional..."
              class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
            />
          </div>
        </div>

        <div class="flex gap-3 justify-end mt-6">
          <button
            @click="cancel"
            class="px-5 py-2 font-sans text-sm text-brand-olive border-2 border-brand-olive/20 hover:border-brand-olive/40 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="confirm"
            :disabled="!form.channel"
            class="px-5 py-2 font-sans text-sm text-white transition-colors"
            :class="form.channel ? 'bg-brand-primary hover:bg-brand-primary/90' : 'bg-brand-olive/30 cursor-not-allowed'"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  visible: { type: Boolean, default: false },
  subscriberCount: { type: Number, default: 1 },
  subscriberEmail: { type: String, default: '' },
  promoCodes: { type: Array, default: () => [] },
})

const emit = defineEmits(['confirm', 'cancel'])

const today = new Date().toISOString().split('T')[0]

const form = ref({
  channel: '',
  contactedAt: today,
  note: '',
})

const selectedPromoCode = ref('')

const selectedPromo = computed(() => {
  if (!selectedPromoCode.value) return null
  return props.promoCodes.find(p => p.id === selectedPromoCode.value)
})

function confirm() {
  if (!form.value.channel) return
  emit('confirm', {
    channel: form.value.channel,
    promoCodeSent: selectedPromo.value?.code || null,
    promoCodeId: selectedPromoCode.value || null,
    contactedAt: form.value.contactedAt,
    note: form.value.note,
  })
  resetForm()
}

function cancel() {
  emit('cancel')
  resetForm()
}

function resetForm() {
  form.value = {
    channel: '',
    contactedAt: today,
    note: '',
  }
  selectedPromoCode.value = ''
}
</script>
