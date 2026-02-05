<template>
  <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
    <UiSkeletonCard v-for="i in count" :key="i" />
  </div>
</template>

<script setup>
defineProps({
  count: {
    type: Number,
    default: 6,
  },
})
</script>
