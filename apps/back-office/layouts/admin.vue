<template>
  <div class="min-h-screen bg-brand-cream">
    <!-- Top Bar -->
    <header class="bg-brand-primary">
      <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 class="font-display text-brand-cream text-xl">EL GRAN PEÓN</h1>
        <button
          @click="handleLogout"
          class="font-sans text-brand-cream/70 text-xs hover:text-brand-cream transition-colors"
        >
          Salir
        </button>
      </div>
    </header>

    <!-- Navigation -->
    <nav class="bg-brand-primary/95 border-t border-brand-cream/10">
      <div class="max-w-7xl mx-auto px-6 flex gap-6">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="font-sans text-sm text-brand-cream/70 py-3 border-b-2 border-transparent hover:text-brand-cream hover:border-brand-cream/50 transition-colors"
          active-class="!text-brand-cream !border-brand-cream"
        >
          {{ item.label }}
        </NuxtLink>
      </div>
    </nav>

    <!-- Content -->
    <main class="max-w-7xl mx-auto px-6 py-8">
      <slot />
    </main>
  </div>
</template>

<script setup>
const { logout } = useAuth()
const router = useRouter()

const navItems = [
  { label: 'Dashboard', to: '/' },
  { label: 'Productos', to: '/productos' },
  { label: 'Categorias', to: '/categorias' },
  { label: 'Pedidos', to: '/pedidos' },
  { label: 'Promo Codes', to: '/promocodes' },
  { label: 'Suscriptores', to: '/suscriptores' },
]

function handleLogout() {
  logout()
  router.push('/login')
}
</script>
