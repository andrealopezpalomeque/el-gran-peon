<template>
  <header
    :class="[
      'bg-brand-cream border-b border-brand-olive/10 transition-shadow duration-200 relative overflow-visible',
      scrolled ? 'shadow-sm' : '',
    ]"
  >
    <div class="container mx-auto px-6">
      <!-- Desktop Header -->
      <div class="hidden lg:flex items-center justify-between h-28 relative overflow-visible">
        <!-- Left: Navigation -->
        <nav class="flex items-center gap-8">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="font-sans text-sm font-medium text-brand-olive hover:text-brand-primary transition-colors"
            active-class="text-brand-primary border-b-2 border-brand-primary"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>

        <!-- Center: Logo -->
        <NuxtLink to="/" class="absolute left-1/2 -translate-x-1/2">
          <img
            :src="logoUrl"
            alt="El Gran Peón"
            class="h-56"
          />
        </NuxtLink>

        <!-- Right: Cart + WhatsApp CTA -->
        <div class="flex items-center gap-4">
          <NuxtLink to="/carrito" class="relative text-brand-olive hover:text-brand-primary transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span
              v-if="cart.itemCount > 0"
              class="absolute -top-2 -right-2 bg-brand-primary text-brand-cream text-xs w-5 h-5 flex items-center justify-center font-sans font-medium"
            >
              {{ cart.itemCount }}
            </span>
          </NuxtLink>

          <a
            :href="whatsappUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-primary flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            CONTACTANOS
          </a>
        </div>
      </div>

      <!-- Mobile Header -->
      <div class="flex lg:hidden items-center justify-between h-20 relative overflow-visible">
        <!-- Left: Hamburger -->
        <button
          @click="mobileMenuOpen = true"
          class="text-brand-olive p-2 -ml-2"
          aria-label="Abrir menú"
        >
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="square" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- Center: Logo -->
        <NuxtLink to="/" class="absolute left-1/2 -translate-x-1/2">
          <img
            :src="logoUrl"
            alt="El Gran Peón"
            class="h-36"
          />
        </NuxtLink>

        <!-- Right: Cart + WhatsApp -->
        <div class="flex items-center gap-1">
          <NuxtLink to="/carrito" class="relative text-brand-olive hover:text-brand-primary transition-colors p-2" aria-label="Ver carrito">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span
              v-if="cart.itemCount > 0"
              class="absolute top-0 right-0 bg-brand-primary text-brand-cream text-xs w-5 h-5 flex items-center justify-center font-sans font-medium"
            >
              {{ cart.itemCount }}
            </span>
          </NuxtLink>
          <a
            :href="whatsappUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="text-brand-primary p-2 -mr-2"
            aria-label="Contactar por WhatsApp"
          >
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </a>
        </div>
      </div>
    </div>

    <!-- Mobile Menu Overlay -->
    <Transition name="slide">
      <div
        v-if="mobileMenuOpen"
        class="fixed inset-0 z-50 bg-brand-cream"
      >
        <div class="flex items-center justify-between px-6 h-20 border-b border-brand-olive/10 overflow-visible">
          <NuxtLink to="/" @click="mobileMenuOpen = false" class="-ml-6">
            <img
              :src="logoUrl"
              alt="El Gran Peón"
              class="h-36"
            />
          </NuxtLink>
          <button
            @click="mobileMenuOpen = false"
            class="text-brand-olive p-2 -mr-2"
            aria-label="Cerrar menú"
          >
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="square" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <nav class="px-6 py-8">
          <NuxtLink
            v-for="link in mobileNavLinks"
            :key="link.to"
            :to="link.to"
            class="block py-4 font-sans text-lg font-medium text-brand-olive hover:text-brand-primary transition-colors border-b border-brand-olive/10"
            active-class="text-brand-primary"
            @click="mobileMenuOpen = false"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>

        <div class="px-6 mt-4">
          <a
            :href="whatsappUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-primary w-full flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            CONTACTANOS POR WHATSAPP
          </a>
        </div>
      </div>
    </Transition>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import logoUrl from '~/assets/images/logo.png'

const cart = useCartStore()
const whatsappUrl = 'https://wa.me/543794007759?text=Hola!%20Quiero%20consultar%20sobre%20los%20productos%20de%20El%20Gran%20Pe%C3%B3n'

const navLinks = [
  { to: '/productos', label: 'Productos' },
  { to: '/nosotros', label: 'Nosotros' },
  { to: '/empresariales', label: 'Empresariales' },
  { to: '/mayoristas', label: 'Mayoristas' },
]

const mobileNavLinks = [
  { to: '/productos', label: 'Productos' },
  { to: '/nosotros', label: 'Nosotros' },
  { to: '/empresariales', label: 'Empresariales' },
  { to: '/mayoristas', label: 'Mayoristas' },
  { to: '/contacto', label: 'Contacto' },
]

const mobileMenuOpen = ref(false)
const scrolled = ref(false)

function handleScroll() {
  scrolled.value = window.scrollY > 0
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.slide-enter-active {
  transition: transform 0.3s ease;
}
.slide-leave-active {
  transition: transform 0.25s ease;
}
.slide-enter-from {
  transform: translateX(-100%);
}
.slide-leave-to {
  transform: translateX(-100%);
}
</style>
