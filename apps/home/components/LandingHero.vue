<template>
  <section class="relative min-h-dvh h-dvh flex items-center justify-center">
    <!-- Content -->
    <div class="relative z-10 container mx-auto px-6 text-center pt-24">
      <!-- Headline (all uppercase) -->
      <h1 class="font-display text-brand-cream text-hero-mobile md:text-hero mb-8">
        ACÁ EMPIEZA EL GRAN PEÓN
      </h1>

      <!-- Subtitle -->
      <p class="font-serif text-brand-cream/90 text-lg md:text-xl max-w-md mx-auto mb-10">
        Hecho para durar. Como las cosas bien hechas.
      </p>

      <!-- Subscribe Form -->
      <form @submit.prevent="handleSubmit" class="max-w-sm mx-auto" action="#" method="post">
        <label for="email" class="sr-only">Email</label>
        <div class="flex flex-col sm:flex-row gap-3">
          <input
            v-model="email"
            type="email"
            id="email"
            name="email"
            autocomplete="email"
            inputmode="email"
            enterkeyhint="send"
            required
            placeholder="Ingresá tu email"
            class="flex-1 px-4 py-3 bg-brand-cream/10 border border-brand-cream/30 text-brand-cream placeholder-brand-cream/50 font-sans text-sm focus:outline-none focus:border-brand-cream/60 transition-colors"
          />
          <button
            type="submit"
            :disabled="isLoading"
            class="px-6 py-3 bg-brand-cream text-brand-primary font-sans font-medium text-sm tracking-wide hover:bg-brand-cream/90 transition-colors disabled:opacity-50"
          >
            {{ isLoading ? 'Enviando...' : 'Avisame' }}
          </button>
        </div>

        <!-- Microcopy -->
        <p class="mt-4 font-sans text-brand-cream/60 text-xs">
          Aviso de lanzamiento + descuento de bienvenida. Sin spam.
        </p>

        <!-- Success/Error Messages -->
        <p v-if="successMessage" class="mt-4 font-sans text-green-400 text-sm">
          {{ successMessage }}
        </p>
        <p v-if="errorMessage" class="mt-4 font-sans text-red-400 text-sm">
          {{ errorMessage }}
        </p>
      </form>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('')
const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const config = useRuntimeConfig()

async function handleSubmit() {
  isLoading.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    const response = await fetch(`${config.public.apiBase}/api/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email.value }),
    })

    const data = await response.json()

    if (response.ok) {
      successMessage.value = '¡Listo! Te avisaremos cuando estemos online.'
      email.value = ''
    } else {
      errorMessage.value = data.error || 'Algo salió mal. Intentá de nuevo.'
    }
  } catch (error) {
    errorMessage.value = 'Error de conexión. Intentá de nuevo.'
  } finally {
    isLoading.value = false
  }
}
</script>
