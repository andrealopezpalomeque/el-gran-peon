<template>
  <div class="relative" ref="wrapper">
    <button
      type="button"
      @click="open = !open"
      class="inline-flex items-center gap-1.5 font-sans font-medium transition-colors"
      :class="buttonClass"
      :disabled="isFinal || updating"
    >
      <span v-if="updating" class="w-3 h-3 border-2 border-current border-t-transparent animate-spin" />
      <AdminStatusBadge v-else :status="currentStatus" type="order" />
      <svg v-if="!isFinal" class="w-3 h-3 text-brand-olive/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div
      v-if="open && !isFinal"
      class="absolute z-50 mt-1 bg-white border-2 border-brand-olive/20 min-w-[180px]"
      :class="size === 'sm' ? 'right-0' : 'left-0'"
    >
      <button
        v-for="status in nextStatuses"
        :key="status"
        type="button"
        @click="changeStatus(status)"
        class="w-full px-3 py-2 text-left font-sans text-sm text-brand-olive hover:bg-brand-cream transition-colors flex items-center gap-2"
      >
        <span
          class="w-2 h-2 inline-block"
          :class="dotColor(status)"
        />
        {{ statusLabel(status) }}
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  currentStatus: { type: String, required: true },
  orderId: { type: String, required: true },
  size: { type: String, default: 'sm' },
})

const emit = defineEmits(['updated'])

const { patch } = useApi()
const open = ref(false)
const updating = ref(false)
const wrapper = ref(null)

const STATUS_FLOW = {
  nuevo: ['contactado', 'cancelado'],
  contactado: ['en_conversacion', 'cancelado'],
  en_conversacion: ['confirmado', 'cancelado'],
  confirmado: ['pagado', 'cancelado'],
  pagado: ['enviado', 'cancelado'],
  enviado: ['entregado'],
  entregado: [],
  cancelado: [],
}

const STATUS_LABELS = {
  nuevo: 'Nuevo',
  contactado: 'Contactado',
  en_conversacion: 'En conversacion',
  confirmado: 'Confirmado',
  pagado: 'Pagado',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

const STATUS_DOTS = {
  nuevo: 'bg-blue-500',
  contactado: 'bg-yellow-500',
  en_conversacion: 'bg-orange-500',
  confirmado: 'bg-purple-500',
  pagado: 'bg-green-500',
  enviado: 'bg-indigo-500',
  entregado: 'bg-emerald-500',
  cancelado: 'bg-gray-500',
}

const nextStatuses = computed(() => STATUS_FLOW[props.currentStatus] || [])
const isFinal = computed(() => nextStatuses.value.length === 0)

const buttonClass = computed(() => {
  if (props.size === 'lg') return 'text-sm'
  return 'text-xs'
})

function statusLabel(status) {
  return STATUS_LABELS[status] || status
}

function dotColor(status) {
  return STATUS_DOTS[status] || 'bg-gray-500'
}

async function changeStatus(newStatus) {
  open.value = false
  updating.value = true
  try {
    const updated = await patch(`/api/orders/${props.orderId}/status`, { status: newStatus })
    emit('updated', updated)
  } catch (error) {
    console.error('Error updating status:', error)
  } finally {
    updating.value = false
  }
}

function handleClickOutside(e) {
  if (wrapper.value && !wrapper.value.contains(e.target)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>
