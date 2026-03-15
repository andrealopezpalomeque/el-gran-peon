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
        <h3 class="font-sans text-brand-olive text-lg font-semibold mb-2">{{ title }}</h3>
        <p class="font-sans text-brand-olive/70 text-sm mb-6">{{ message }}</p>

        <div class="flex gap-3 justify-end">
          <button
            @click="cancel"
            :disabled="loading"
            class="px-5 py-2 font-sans text-sm text-brand-olive border-2 border-brand-olive/20 hover:border-brand-olive/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            @click="confirm"
            :disabled="loading"
            class="px-5 py-2 font-sans text-sm text-white bg-red-700 hover:bg-red-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Eliminando...' : confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: 'Confirmar accion' },
  message: { type: String, default: 'Esta accion no se puede deshacer.' },
  confirmText: { type: String, default: 'Eliminar' },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['confirm', 'cancel'])

function confirm() {
  emit('confirm')
}

function cancel() {
  emit('cancel')
}
</script>
