<template>
  <div>
    <!-- Registration Modal Overlay -->
    <div v-if="!isRegistered" class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <!-- Modal -->
      <div class="relative w-full max-w-md mx-4 md:mx-0 bg-brand-cream border-2 border-brand-olive/20 max-h-[90vh] overflow-y-auto">
        <!-- Back arrow -->
        <button @click="$router.back()" class="absolute top-4 left-4 z-10 text-brand-olive/60 hover:text-brand-olive transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="square" stroke-linejoin="miter" d="M19 12H5m7-7-7 7 7 7" />
          </svg>
        </button>

        <div class="p-8 md:p-10">
          <!-- Header -->
          <h2 class="font-display text-brand-olive text-2xl md:text-3xl text-center">
            REGALOS EMPRESARIALES
          </h2>
          <p class="font-serif text-brand-olive/70 text-sm md:text-base text-center mt-3 leading-relaxed">
            Registrate para acceder a nuestro catálogo de regalos corporativos y condiciones especiales.
          </p>

          <!-- Form -->
          <form class="mt-8 space-y-4" @submit.prevent="handleSubmit">
            <div>
              <label class="block font-sans text-xs uppercase tracking-wide text-brand-olive/60 mb-1">
                Nombre o Razón Social
              </label>
              <input
                v-model="form.nombreRazonSocial"
                type="text"
                required
                placeholder="Persona o empresa"
                class="w-full px-4 py-3 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-olive transition-colors"
              />
            </div>

            <div>
              <label class="block font-sans text-xs uppercase tracking-wide text-brand-olive/60 mb-1">
                Método de contacto
              </label>
              <div class="flex gap-6 mt-2">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" v-model="form.contactType" value="email" class="accent-brand-olive" />
                  <span class="font-sans text-sm text-brand-olive">Email</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" v-model="form.contactType" value="telefono" class="accent-brand-olive" />
                  <span class="font-sans text-sm text-brand-olive">Teléfono</span>
                </label>
              </div>
            </div>

            <div>
              <label class="block font-sans text-xs uppercase tracking-wide text-brand-olive/60 mb-1">
                {{ form.contactType === 'email' ? 'Email' : 'Teléfono' }}
              </label>
              <input
                v-model="form.contactValue"
                :type="form.contactType === 'email' ? 'email' : 'tel'"
                required
                :placeholder="form.contactType === 'email' ? 'tu@email.com' : '+54 ...'"
                class="w-full px-4 py-3 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-olive transition-colors"
              />
            </div>

            <!-- Error message -->
            <p v-if="errorMsg" class="font-sans text-sm text-red-600">
              {{ errorMsg }}
            </p>

            <!-- Submit -->
            <button
              type="submit"
              :disabled="submitting"
              class="w-full bg-brand-olive text-brand-cream font-sans text-sm uppercase tracking-widest py-3 mt-2 hover:bg-brand-olive/90 transition-colors disabled:opacity-50"
            >
              {{ submitting ? 'REGISTRANDO...' : 'REGISTRARME Y VER CATÁLOGO' }}
            </button>
          </form>

          <p class="font-sans text-xs text-brand-olive/40 text-center mt-6">
            Tus datos se mantienen privados y seguros.
          </p>
        </div>
      </div>
    </div>

    <!-- Page Content (always rendered, blurred when modal is showing) -->
    <div :class="{ 'blur-sm pointer-events-none select-none': !isRegistered }">
      <!-- Hero header -->
      <section class="bg-brand-olive py-12 md:py-16">
        <div class="container mx-auto px-6 text-center">
          <p class="font-sans text-xs uppercase tracking-widest text-brand-cream/60 mb-4">
            PARA EMPRESAS
          </p>
          <h1 class="font-display text-brand-cream text-3xl md:text-4xl">
            REGALOS EMPRESARIALES
          </h1>
          <p class="font-serif text-brand-cream/80 text-base md:text-lg mt-4 max-w-xl mx-auto leading-relaxed">
            Productos pensados para empresas que valoran la identidad y el trabajo bien hecho. Desarrollamos piezas personalizadas cuidando los materiales y el resultado final.
          </p>
        </div>
      </section>

      <!-- Product catalog -->
      <section class="container mx-auto px-4 md:px-6 py-10 md:py-16">
        <!-- Loading -->
        <UiSkeletonGrid v-if="loadingProducts" :count="6" />

        <!-- Product grid -->
        <div v-else-if="products.length" class="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <ProductCard
            v-for="product in products"
            :key="product.id"
            :product="product"
          />
        </div>

        <!-- Empty state -->
        <div v-else class="text-center py-20">
          <p class="font-serif text-brand-olive/60 text-lg">
            Estamos preparando el catálogo empresarial.
          </p>
          <p class="font-sans text-sm text-brand-olive/40 mt-2">
            Mientras tanto, escribinos por WhatsApp para consultar disponibilidad.
          </p>
        </div>

        <!-- WhatsApp CTA -->
        <div class="mt-12 md:mt-16 text-center">
          <p class="font-serif text-brand-olive/70 text-base mb-4">
            ¿Querés cotizar regalos corporativos personalizados?
          </p>
          <a
            href="https://wa.me/543794007759?text=Hola!%20Quiero%20consultar%20sobre%20regalos%20empresariales%20de%20El%20Gran%20Pe%C3%B3n"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-block border-2 border-brand-olive text-brand-olive font-sans text-sm uppercase tracking-widest px-8 py-3 hover:bg-brand-olive hover:text-brand-cream transition-colors duration-200"
          >
            HABLAR CON UN REPRESENTANTE
          </a>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const { get, post } = useApi()
const { hidden: hideWhatsApp } = useWhatsAppVisibility()

const STORAGE_KEY = 'egp-empresariales'

const isRegistered = ref(false)

watch(isRegistered, (val) => { hideWhatsApp.value = !val }, { immediate: true })
onBeforeUnmount(() => { hideWhatsApp.value = false })
const submitting = ref(false)
const errorMsg = ref('')
const products = ref([])
const loadingProducts = ref(true)

const form = ref({
  nombreRazonSocial: '',
  contactType: 'email',
  contactValue: '',
})

// Check localStorage on mount
onMounted(() => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const data = JSON.parse(stored)
      if (data.registered) {
        isRegistered.value = true
      }
    }
  } catch {
    // ignore parse errors
  }
  fetchProducts()
})

async function handleSubmit() {
  errorMsg.value = ''
  submitting.value = true

  try {
    await post('/api/subscribe', {
      nombreRazonSocial: form.value.nombreRazonSocial,
      contactType: form.value.contactType,
      contactValue: form.value.contactValue,
      source: 'empresariales',
    })

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      registered: true,
    }))

    isRegistered.value = true
  } catch (error) {
    const msg = error.message || ''
    // If already registered, treat as success (let them through)
    if (msg.includes('ya está registrado')) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        registered: true,
      }))
      isRegistered.value = true
    } else {
      errorMsg.value = msg || 'Error al registrarte. Intentá de nuevo.'
    }
  } finally {
    submitting.value = false
  }
}

async function fetchProducts() {
  loadingProducts.value = true
  const data = await get('/api/products?parentCategory=empresariales')
  products.value = data || []
  loadingProducts.value = false
}

useHead({
  title: 'Regalos Empresariales | El Gran Peón',
  meta: [
    { name: 'description', content: 'Regalos empresariales personalizados de El Gran Peón. Mates, bombillas, cuchillos y artículos de campo para tu empresa.' },
  ],
})
</script>
