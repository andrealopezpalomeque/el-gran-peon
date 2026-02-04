<template>
  <div class="min-h-screen bg-brand-cream flex items-center justify-center px-6">
    <div class="w-full max-w-sm">
      <h1 class="font-display text-brand-primary text-3xl text-center mb-8">EL GRAN PEÓN</h1>
      <p class="font-sans text-brand-olive text-center mb-8">BACK OFFICE</p>

      <form @submit.prevent="handleLogin">
        <input
          v-model="apiKey"
          type="password"
          placeholder="Clave de acceso"
          class="w-full px-4 py-3 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors mb-4"
        />
        <button
          type="submit"
          class="w-full px-6 py-3 bg-brand-primary text-brand-cream font-sans font-medium text-sm tracking-wide hover:bg-brand-primary/90 transition-colors"
        >
          Entrar
        </button>
        <p v-if="error" class="mt-4 font-sans text-red-600 text-sm text-center">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: false })

const apiKey = ref('')
const error = ref('')
const { login } = useAuth()
const router = useRouter()

function handleLogin() {
  error.value = ''
  const success = login(apiKey.value)
  if (success) {
    router.push('/')
  } else {
    error.value = 'Clave incorrecta'
  }
}
</script>
