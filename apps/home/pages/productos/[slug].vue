<template>
  <!-- Loading state -->
  <div v-if="loading" class="container mx-auto px-4 md:px-6 pt-4 pb-10 md:pt-6 md:pb-16">
    <div class="animate-pulse">
      <div class="h-3 w-48 bg-brand-olive/5 mb-6" />
      <div class="md:flex gap-10">
        <div class="md:w-1/2">
          <div class="aspect-[4/3] bg-brand-olive/5" />
        </div>
        <div class="md:w-1/2 mt-6 md:mt-0 space-y-4">
          <div class="h-3 w-20 bg-brand-olive/5" />
          <div class="h-8 w-3/4 bg-brand-olive/5" />
          <div class="h-6 w-28 bg-brand-olive/5" />
          <div class="h-20 w-full bg-brand-olive/5 mt-6" />
          <div class="h-12 w-full bg-brand-olive/5 mt-6" />
        </div>
      </div>
    </div>
  </div>

  <!-- 404 state -->
  <div v-else-if="!product" class="container mx-auto px-4 md:px-6 py-20 text-center">
    <h1 class="font-display text-brand-primary text-3xl">PRODUCTO NO ENCONTRADO</h1>
    <p class="font-serif text-brand-olive/60 mt-4">El producto que buscás no existe o fue removido.</p>
    <NuxtLink
      to="/productos"
      class="inline-block mt-6 font-sans text-sm text-brand-primary underline underline-offset-4 hover:text-brand-primary/80 transition-colors duration-200"
    >
      Ver todos los productos
    </NuxtLink>
  </div>

  <!-- Product detail -->
  <div v-else>
    <div class="container mx-auto px-4 md:px-6 pt-4 pb-10 md:pt-6 md:pb-16">
      <!-- Breadcrumb -->
      <UiBreadcrumb :items="breadcrumbItems" class="mb-6" />

      <div class="md:flex gap-10">
        <!-- Left: Image Gallery -->
        <div class="md:w-1/2">
          <!-- Main image with carousel arrows -->
          <div class="relative group aspect-[4/3] overflow-hidden bg-brand-olive/5">
            <img
              v-if="mainImage && !mainImgBroken"
              :src="mainImage"
              :alt="product.name"
              class="w-full h-full object-cover"
              @error="mainImgBroken = true"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <img src="/images/icon.png" alt="El Gran Peón" class="w-24 h-24 opacity-20" />
            </div>

            <!-- Carousel arrows (only if multiple images) -->
            <template v-if="product.images && product.images.length > 1">
              <button
                class="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-brand-cream/80 text-brand-olive hover:bg-brand-cream transition-colors duration-200 opacity-0 group-hover:opacity-100"
                @click="prevImage"
                aria-label="Imagen anterior"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-brand-cream/80 text-brand-olive hover:bg-brand-cream transition-colors duration-200 opacity-0 group-hover:opacity-100"
                @click="nextImage"
                aria-label="Imagen siguiente"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <!-- Image counter -->
              <span class="absolute bottom-3 right-3 font-sans text-xs text-brand-cream bg-black/40 px-2 py-1">
                {{ selectedImageIndex + 1 }} / {{ product.images.length }}
              </span>
            </template>
          </div>
          <!-- Thumbnails -->
          <div
            v-if="product.images && product.images.length > 1"
            class="flex gap-2 mt-3 overflow-x-auto scrollbar-hide"
          >
            <button
              v-for="(img, index) in product.images"
              :key="index"
              class="shrink-0 w-16 h-16 overflow-hidden border-2 transition-colors duration-200"
              :class="selectedImageIndex === index ? 'border-brand-primary' : 'border-transparent hover:border-brand-olive/20'"
              @click="selectedImageIndex = index"
            >
              <img
                :src="img.url"
                :alt="`${product.name} - ${index + 1}`"
                class="w-full h-full object-cover"
                @error="onThumbError"
              />
            </button>
          </div>
        </div>

        <!-- Right: Product Info -->
        <div class="md:w-1/2 mt-8 md:mt-0">
          <!-- Category -->
          <p v-if="product.categoryName" class="font-sans text-xs uppercase tracking-wide text-brand-olive/60">
            {{ product.categoryName }}
          </p>

          <!-- Name -->
          <h1 class="font-display uppercase text-brand-primary text-2xl md:text-3xl mt-2">
            {{ product.name.toUpperCase() }}
          </h1>

          <!-- Price -->
          <div class="mt-4 flex items-center gap-3">
            <span
              v-if="product.compareAtPrice"
              class="font-sans line-through text-brand-olive/40"
            >
              {{ formatPrice(product.compareAtPrice) }}
            </span>
            <span class="font-sans font-bold text-brand-primary text-2xl">
              {{ formatPrice(product.price) }}
            </span>
          </div>

          <!-- Stock indicator -->
          <div v-if="product.stock === 0" class="mt-3">
            <span class="inline-block font-sans text-xs uppercase tracking-wide px-3 py-1 bg-brand-olive/10 text-brand-olive/60">
              Sin stock
            </span>
          </div>
          <div v-else-if="product.stock > 0 && product.stock <= 5" class="mt-3">
            <span class="font-sans text-xs text-brand-primary">
              Últimas {{ product.stock }} unidades
            </span>
          </div>

          <!-- Description -->
          <p v-if="product.description" class="font-serif text-brand-olive leading-relaxed mt-6">
            {{ product.description }}
          </p>

          <!-- Quantity selector -->
          <div class="mt-8 flex items-center gap-4">
            <span class="font-sans text-sm text-brand-olive/60">Cantidad</span>
            <div class="flex items-center border border-brand-olive/20">
              <button
                class="w-10 h-10 flex items-center justify-center font-sans text-brand-olive hover:bg-brand-olive/5 transition-colors duration-200 disabled:opacity-30"
                :disabled="quantity <= 1"
                @click="quantity > 1 && quantity--"
              >
                −
              </button>
              <span class="w-12 h-10 flex items-center justify-center font-sans text-sm text-brand-olive border-x border-brand-olive/20">
                {{ quantity }}
              </span>
              <button
                class="w-10 h-10 flex items-center justify-center font-sans text-brand-olive hover:bg-brand-olive/5 transition-colors duration-200"
                @click="quantity++"
              >
                +
              </button>
            </div>
          </div>

          <!-- Add to cart button -->
          <button
            class="w-full mt-6 py-4 font-sans font-medium tracking-wide text-sm transition-colors duration-200"
            :class="product.stock === 0
              ? 'bg-brand-olive/10 text-brand-olive/40 cursor-not-allowed'
              : 'bg-brand-primary text-brand-cream hover:bg-brand-primary/90'"
            :disabled="product.stock === 0"
          >
            {{ product.stock === 0 ? 'SIN STOCK' : 'AGREGAR AL CARRITO' }}
          </button>

          <!-- Divider -->
          <div class="border-t border-brand-olive/10 mt-8 pt-8">
            <!-- Bulk section -->
            <div v-if="product.bulkAvailable">
              <p class="font-sans text-sm text-brand-olive/60">
                ¿Comprás en cantidad? Consultanos por WhatsApp
              </p>
              <a
                :href="bulkWhatsappUrl"
                target="_blank"
                rel="noopener"
                class="inline-flex items-center gap-2 mt-3 font-sans text-sm text-brand-primary hover:text-brand-primary/80 transition-colors duration-200"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.116.553 4.1 1.519 5.828L.057 23.681l5.994-1.57A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.82c-1.94 0-3.79-.508-5.417-1.467l-.388-.231-4.025 1.055 1.074-3.922-.253-.402A9.777 9.777 0 012.18 12c0-5.422 4.398-9.82 9.82-9.82 5.422 0 9.82 4.398 9.82 9.82 0 5.422-4.398 9.82-9.82 9.82z" />
                </svg>
                Consultar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Related Products -->
    <div v-if="relatedProducts.length" class="bg-brand-cream">
      <div class="container mx-auto px-4 md:px-6 py-16">
        <h2 class="font-display text-brand-primary text-2xl md:text-3xl text-center mb-10">
          TAMBIÉN TE PUEDE INTERESAR
        </h2>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <ProductCard
            v-for="related in relatedProducts"
            :key="related.id"
            :product="related"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { formatPrice } from '~/utils/format'

const route = useRoute()
const { get } = useApi()

const product = ref(null)
const relatedProducts = ref([])
const categoryMap = ref({}) // Maps category ID → { slug, name, parentSlug, parentName }
const loading = ref(true)
const selectedImageIndex = ref(0)
const mainImgBroken = ref(false)
const quantity = ref(1)

function onThumbError(e) {
  e.target.src = '/images/icon.png'
  e.target.classList.remove('object-cover')
  e.target.classList.add('object-contain', 'p-2', 'opacity-20')
}

const mainImage = computed(() => {
  if (product.value?.images?.length) {
    return product.value.images[selectedImageIndex.value]?.url || product.value.images[0].url
  }
  return null
})

function prevImage() {
  if (!product.value?.images?.length) return
  mainImgBroken.value = false
  selectedImageIndex.value = selectedImageIndex.value > 0
    ? selectedImageIndex.value - 1
    : product.value.images.length - 1
}

function nextImage() {
  if (!product.value?.images?.length) return
  mainImgBroken.value = false
  selectedImageIndex.value = selectedImageIndex.value < product.value.images.length - 1
    ? selectedImageIndex.value + 1
    : 0
}

const breadcrumbItems = computed(() => {
  if (!product.value) return []
  const items = [
    { label: 'Inicio', to: '/' },
    { label: 'Productos', to: '/productos' },
  ]
  const catInfo = categoryMap.value[product.value.categoryId]
  if (catInfo) {
    if (catInfo.parentSlug) {
      items.push({
        label: catInfo.parentName,
        to: `/productos?categoria=${catInfo.parentSlug}`,
      })
    }
    items.push({
      label: catInfo.name,
      to: `/productos?categoria=${catInfo.slug}`,
    })
  } else {
    if (product.value.parentCategoryName) {
      items.push({ label: product.value.parentCategoryName, to: '/productos' })
    }
    if (product.value.categoryName) {
      items.push({ label: product.value.categoryName, to: '/productos' })
    }
  }
  items.push({ label: product.value.name, to: null })
  return items
})

// Slug of the child category for related products query
const categorySlugs = computed(() => {
  const catInfo = categoryMap.value[product.value?.categoryId]
  return catInfo?.slug || null
})

const bulkWhatsappUrl = computed(() => {
  if (!product.value) return '#'
  const message = product.value.bulkWhatsappMessage
    || `Hola! Quiero consultar por compra mayorista de ${product.value.name}`
  return `https://wa.me/543794007759?text=${encodeURIComponent(message)}`
})

async function fetchCategories() {
  const data = await get('/api/categories')
  if (!data) return
  const map = {}
  for (const parent of data) {
    if (!parent.parentId) {
      map[parent.id] = { slug: parent.slug, name: parent.name, parentSlug: null, parentName: null }
      if (parent.children) {
        for (const child of parent.children) {
          map[child.id] = { slug: child.slug, name: child.name, parentSlug: parent.slug, parentName: parent.name }
        }
      }
    }
  }
  categoryMap.value = map
}

async function fetchProduct() {
  loading.value = true
  const data = await get(`/api/products/${route.params.slug}`)
  product.value = data
  loading.value = false
}

async function fetchRelatedProducts() {
  if (!product.value?.categoryId) return
  const slug = categorySlugs.value
  if (!slug) return
  const data = await get(`/api/products?category=${slug}&limit=5`)
  if (data) {
    relatedProducts.value = data
      .filter(p => p.id !== product.value.id)
      .slice(0, 4)
  }
}

onMounted(async () => {
  // Fetch categories and product in parallel
  const [_, __] = await Promise.all([fetchCategories(), fetchProduct()])
  if (product.value) {
    await fetchRelatedProducts()
  }
})

useHead({
  title: computed(() => {
    if (product.value) {
      return `${product.value.name} | El Gran Peón`
    }
    return 'Producto | El Gran Peón'
  }),
  meta: computed(() => {
    if (product.value?.shortDescription) {
      return [{ name: 'description', content: product.value.shortDescription }]
    }
    return []
  }),
})
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
