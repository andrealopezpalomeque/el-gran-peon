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
        <div class="relative mb-4">
          <input
            v-model="accessCode"
            :type="showCode ? 'text' : 'password'"
            placeholder="Código de acceso"
            class="w-full px-4 py-3 pr-11 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
            autofocus
          />
          <button
            type="button"
            @click="showCode = !showCode"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-brand-olive/40 hover:text-brand-olive transition-colors"
          >
            <svg v-if="showCode" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
            </svg>
          </button>
        </div>
        <button
          type="submit"
          :disabled="loading"
          class="w-full px-6 py-3 bg-brand-primary text-brand-cream font-sans font-medium text-sm tracking-wide hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
        >
          {{ loading ? 'Verificando...' : 'Entrar' }}
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
const showCode = ref(false)
const loading = ref(false)
const router = useRouter()
const config = useRuntimeConfig()

async function checkAccess() {
  error.value = ''
  loading.value = true

  // Brief delay for UX feedback
  await new Promise(r => setTimeout(r, 400))

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
    loading.value = false
  }
}
</script>
