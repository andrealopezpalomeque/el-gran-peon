<template>
  <div class="min-h-dvh bg-brand-cream flex items-center justify-center px-6">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <img
          src="/images/logo.png"
          alt="El Gran Peón"
          class="h-56 md:h-64 mx-auto mb-4"
        />
        <h1 class="font-display text-brand-primary text-2xl mb-2">EL GRAN PEÓN</h1>
        <p class="font-serif text-brand-olive">Acceso restringido</p>
      </div>

      <form @submit.prevent="checkAccess">
        <input
          v-model="accessCode"
          type="password"
          placeholder="Código de acceso"
          class="w-full px-4 py-3 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors mb-4"
          autofocus
        />
        <button
          type="submit"
          class="w-full px-6 py-3 bg-brand-primary text-brand-cream font-sans font-medium text-sm tracking-wide hover:bg-brand-primary/90 transition-colors"
        >
          Entrar
        </button>
        <p v-if="error" class="mt-4 font-sans text-red-600 text-sm text-center">{{ error }}</p>
      </form>

      <div class="mt-8 text-center">
        <NuxtLink
          to="/subscription"
          class="font-sans text-brand-olive/60 text-sm hover:text-brand-primary transition-colors"
        >
          ¿Querés recibir noticias? Suscribite acá
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

definePageMeta({
  layout: false
})

const accessCode = ref('')
const error = ref('')
const router = useRouter()
const config = useRuntimeConfig()

function checkAccess() {
  error.value = ''

  if (accessCode.value === config.public.accessCode) {
    // Set access cookie (expires in 30 days)
    const hasAccess = useCookie('elgranpeon-access', {
      default: () => false,
      maxAge: 60 * 60 * 24 * 30,
    })
    hasAccess.value = true

    // Redirect to homepage
    router.push('/')
  } else {
    error.value = 'Código incorrecto'
  }
}
</script>
