<template>
  <div class="w-full bg-brand-primary text-brand-cream py-2 relative z-10">
    <div class="container mx-auto px-6 flex items-center justify-center">
      <Transition name="fade" mode="out-in">
        <p
          :key="currentIndex"
          class="font-sans text-xs tracking-wide text-center"
        >
          {{ messages[currentIndex] }}
        </p>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const messages = [
  'Hasta 3 cuotas sin interés con tarjeta de crédito',
  'Envío gratis en compras mayores a $199.999',
  '10% de descuento en transferencia o efectivo',
]

const currentIndex = ref(0)
let interval = null

onMounted(() => {
  interval = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % messages.length
  }, 5000)
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
