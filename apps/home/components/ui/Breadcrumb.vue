<template>
  <nav aria-label="Breadcrumb" class="font-sans text-xs text-brand-olive/50">
    <ol class="flex items-center flex-wrap gap-1">
      <li v-for="(item, index) in items" :key="index" class="flex items-center gap-1">
        <span v-if="index > 0" class="select-none">/</span>
        <NuxtLink
          v-if="item.to"
          :to="item.to"
          class="hover:text-brand-primary transition-colors duration-200"
        >
          {{ item.label }}
        </NuxtLink>
        <span v-else class="text-brand-olive/80">{{ item.label }}</span>
      </li>
    </ol>
  </nav>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    required: true,
  },
})
</script>
