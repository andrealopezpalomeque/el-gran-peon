<template>
  <nav v-if="totalPages > 1" class="flex items-center justify-center gap-1 mt-10">
    <!-- Previous -->
    <button
      :disabled="modelValue <= 1"
      class="font-sans text-sm px-3 py-2 border border-brand-olive/20 text-brand-olive transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:border-brand-primary hover:text-brand-primary"
      @click="goTo(modelValue - 1)"
    >
      Anterior
    </button>

    <!-- Page numbers -->
    <template v-for="page in visiblePages" :key="page">
      <span
        v-if="page === '...'"
        class="font-sans text-sm px-2 py-2 text-brand-olive/40"
      >
        ...
      </span>
      <button
        v-else
        class="font-sans text-sm w-10 py-2 border transition-colors duration-200"
        :class="page === modelValue
          ? 'border-brand-primary bg-brand-primary text-brand-cream'
          : 'border-brand-olive/20 text-brand-olive hover:border-brand-primary hover:text-brand-primary'"
        @click="goTo(page)"
      >
        {{ page }}
      </button>
    </template>

    <!-- Next -->
    <button
      :disabled="modelValue >= totalPages"
      class="font-sans text-sm px-3 py-2 border border-brand-olive/20 text-brand-olive transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:border-brand-primary hover:text-brand-primary"
      @click="goTo(modelValue + 1)"
    >
      Siguiente
    </button>
  </nav>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  totalItems: { type: Number, required: true },
  itemsPerPage: { type: Number, default: 12 },
  modelValue: { type: Number, default: 1 },
})

const emit = defineEmits(['update:modelValue'])

const totalPages = computed(() => Math.ceil(props.totalItems / props.itemsPerPage))

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = props.modelValue
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages = []
  pages.push(1)

  if (current > 3) pages.push('...')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (current < total - 2) pages.push('...')

  pages.push(total)
  return pages
})

function goTo(page) {
  if (page < 1 || page > totalPages.value) return
  emit('update:modelValue', page)
}
</script>
