<template>
  <span
    class="inline-block px-2 py-0.5 font-sans text-xs font-medium uppercase tracking-wide"
    :class="badgeClass"
  >
    {{ label }}
  </span>
</template>

<script setup>
const props = defineProps({
  status: { type: [String, Boolean], required: true },
  type: { type: String, default: 'active' },
})

const badgeClass = computed(() => {
  if (props.type === 'active') {
    return props.status
      ? 'bg-green-100 text-green-800 border border-green-300'
      : 'bg-red-100 text-red-800 border border-red-300'
  }

  // Order statuses
  const statusMap = {
    nuevo: 'bg-blue-100 text-blue-800 border border-blue-300',
    contactado: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
    en_conversacion: 'bg-orange-100 text-orange-800 border border-orange-300',
    confirmado: 'bg-purple-100 text-purple-800 border border-purple-300',
    pagado: 'bg-green-100 text-green-800 border border-green-300',
    enviado: 'bg-indigo-100 text-indigo-800 border border-indigo-300',
    entregado: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
    cancelado: 'bg-gray-100 text-gray-800 border border-gray-300',
  }

  return statusMap[props.status] || 'bg-gray-100 text-gray-800 border border-gray-300'
})

const label = computed(() => {
  if (props.type === 'active') {
    return props.status ? 'Activa' : 'Inactiva'
  }

  const labelMap = {
    nuevo: 'Nuevo',
    contactado: 'Contactado',
    en_conversacion: 'En conversacion',
    confirmado: 'Confirmado',
    pagado: 'Pagado',
    enviado: 'Enviado',
    entregado: 'Entregado',
    cancelado: 'Cancelado',
  }

  return labelMap[props.status] || props.status
})
</script>
