<template>
  <div class="container mx-auto px-4 md:px-6 pt-4 pb-10 md:pt-6 md:pb-16">
    <!-- Breadcrumb -->
    <UiBreadcrumb :items="[{ label: 'Inicio', to: '/' }, { label: 'Carrito', to: null }]" class="mb-6" />

    <h1 class="font-display text-brand-primary text-2xl md:text-3xl">CARRITO</h1>

    <!-- Empty state -->
    <div v-if="cart.items.length === 0" class="mt-12 text-center">
      <svg class="w-16 h-16 mx-auto text-brand-olive/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      <p class="font-serif text-brand-olive/60 mt-6 text-lg">Tu carrito esta vacio</p>
      <NuxtLink
        to="/productos"
        class="inline-block mt-6 font-sans text-sm text-brand-primary underline underline-offset-4 hover:text-brand-primary/80 transition-colors duration-200"
      >
        Ver productos
      </NuxtLink>
    </div>

    <!-- Cart with items -->
    <div v-else class="mt-8">
      <!-- Desktop table -->
      <div class="hidden md:block">
        <table class="w-full">
          <thead>
            <tr class="border-b border-brand-olive/20">
              <th class="pb-4 text-left font-sans text-xs uppercase tracking-wide text-brand-olive/60">Producto</th>
              <th class="pb-4 text-center font-sans text-xs uppercase tracking-wide text-brand-olive/60">Precio</th>
              <th class="pb-4 text-center font-sans text-xs uppercase tracking-wide text-brand-olive/60">Cantidad</th>
              <th class="pb-4 text-right font-sans text-xs uppercase tracking-wide text-brand-olive/60">Subtotal</th>
              <th class="pb-4 w-12"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in cart.items"
              :key="item.productId + (item.customizationKey || '')"
              class="border-b border-brand-olive/10"
            >
              <!-- Product -->
              <td class="py-6">
                <div class="flex items-center gap-4">
                  <NuxtLink :to="`/productos/${item.productSlug}`" class="shrink-0 w-20 h-20 bg-brand-olive/5 overflow-hidden">
                    <img
                      v-if="item.image"
                      :src="item.image"
                      :alt="item.productName"
                      class="w-full h-full object-cover"
                      @error="onImgError"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center">
                      <img src="/images/icon.png" alt="" class="w-8 h-8 opacity-20" />
                    </div>
                  </NuxtLink>
                  <div>
                    <NuxtLink
                      :to="`/productos/${item.productSlug}`"
                      class="font-sans text-sm font-medium text-brand-olive hover:text-brand-primary transition-colors"
                    >
                      {{ item.productName }}
                    </NuxtLink>
                    <p v-if="item.categoryName" class="font-sans text-xs text-brand-olive/50 mt-1">{{ item.categoryName }}</p>
                    <span v-if="cart.isCotizacionItem(item)" class="inline-block font-sans text-[10px] uppercase tracking-wide bg-brand-olive/10 text-brand-olive px-2 py-0.5 mt-1">Cotización</span>
                    <template v-if="item.customizations">
                      <p v-for="(c, key) in item.customizations" :key="key" class="font-sans text-xs text-brand-olive/60 mt-0.5">
                        {{ c.label }}: {{ c.value }}
                        <template v-if="c.text"> — "{{ c.text }}"</template>
                        <template v-if="c.logoUrl"> (logo adjunto)</template>
                        <span v-if="c.extraPrice > 0" class="text-brand-olive/40">(+{{ formatPrice(c.extraPrice) }})</span>
                      </p>
                    </template>
                    <p v-if="item.freeShipping" class="font-sans text-xs text-brand-primary/80 mt-1">Envío gratis</p>
                  </div>
                </div>
              </td>

              <!-- Price -->
              <td class="py-6 text-center font-sans text-sm text-brand-olive">
                {{ item.unitPrice != null ? formatPrice(item.unitPrice) : 'A consultar' }}
              </td>

              <!-- Quantity -->
              <td class="py-6">
                <div class="flex items-center justify-center">
                  <div class="flex items-center border border-brand-olive/20">
                    <button
                      class="w-8 h-8 flex items-center justify-center font-sans text-brand-olive hover:bg-brand-olive/5 transition-colors duration-200"
                      @click="cart.updateQuantity(item.productId, item.quantity - 1, item.customizationKey)"
                    >
                      −
                    </button>
                    <span class="w-10 h-8 flex items-center justify-center font-sans text-sm text-brand-olive border-x border-brand-olive/20">
                      {{ item.quantity }}
                    </span>
                    <button
                      class="w-8 h-8 flex items-center justify-center font-sans text-brand-olive hover:bg-brand-olive/5 transition-colors duration-200 disabled:opacity-30"
                      :disabled="item.stock && item.quantity >= item.stock"
                      @click="cart.updateQuantity(item.productId, item.quantity + 1, item.customizationKey)"
                    >
                      +
                    </button>
                  </div>
                </div>
              </td>

              <!-- Subtotal -->
              <td class="py-6 text-right font-sans text-sm font-medium text-brand-olive">
                {{ item.unitPrice != null ? formatPrice(item.unitPrice * item.quantity) : 'A consultar' }}
              </td>

              <!-- Remove -->
              <td class="py-6 text-right">
                <button
                  @click="cart.removeProduct(item.productId, item.customizationKey)"
                  class="text-brand-olive/40 hover:text-brand-primary transition-colors"
                  aria-label="Eliminar producto"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile list -->
      <div class="md:hidden space-y-6">
        <div
          v-for="item in cart.items"
          :key="item.productId + (item.customizationKey || '')"
          class="border-b border-brand-olive/10 pb-6"
        >
          <div class="flex gap-4">
            <NuxtLink :to="`/productos/${item.productSlug}`" class="shrink-0 w-20 h-20 bg-brand-olive/5 overflow-hidden">
              <img
                v-if="item.image"
                :src="item.image"
                :alt="item.productName"
                class="w-full h-full object-cover"
                @error="onImgError"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <img src="/images/icon.png" alt="" class="w-8 h-8 opacity-20" />
              </div>
            </NuxtLink>

            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <NuxtLink
                    :to="`/productos/${item.productSlug}`"
                    class="font-sans text-sm font-medium text-brand-olive hover:text-brand-primary transition-colors"
                  >
                    {{ item.productName }}
                  </NuxtLink>
                  <p v-if="item.categoryName" class="font-sans text-xs text-brand-olive/50 mt-0.5">{{ item.categoryName }}</p>
                  <span v-if="cart.isCotizacionItem(item)" class="inline-block font-sans text-[10px] uppercase tracking-wide bg-brand-olive/10 text-brand-olive px-2 py-0.5 mt-0.5">Cotización</span>
                  <template v-if="item.customizations">
                    <p v-for="(c, key) in item.customizations" :key="key" class="font-sans text-xs text-brand-olive/60 mt-0.5">
                      {{ c.label }}: {{ c.value }}
                      <span v-if="c.extraPrice > 0" class="text-brand-olive/40">(+{{ formatPrice(c.extraPrice) }})</span>
                    </p>
                  </template>
                  <p v-if="item.freeShipping" class="font-sans text-xs text-brand-primary/80 mt-0.5">Envío gratis</p>
                </div>
                <button
                  @click="cart.removeProduct(item.productId, item.customizationKey)"
                  class="shrink-0 text-brand-olive/40 hover:text-brand-primary transition-colors"
                  aria-label="Eliminar producto"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p class="font-sans text-sm text-brand-olive mt-2">{{ item.unitPrice != null ? formatPrice(item.unitPrice) : 'A consultar' }}</p>

              <div class="flex items-center justify-between mt-3">
                <div class="flex items-center border border-brand-olive/20">
                  <button
                    class="w-8 h-8 flex items-center justify-center font-sans text-brand-olive hover:bg-brand-olive/5 transition-colors duration-200"
                    @click="cart.updateQuantity(item.productId, item.quantity - 1, item.customizationKey)"
                  >
                    −
                  </button>
                  <span class="w-10 h-8 flex items-center justify-center font-sans text-sm text-brand-olive border-x border-brand-olive/20">
                    {{ item.quantity }}
                  </span>
                  <button
                    class="w-8 h-8 flex items-center justify-center font-sans text-brand-olive hover:bg-brand-olive/5 transition-colors duration-200 disabled:opacity-30"
                    :disabled="item.stock && item.quantity >= item.stock"
                    @click="cart.updateQuantity(item.productId, item.quantity + 1, item.customizationKey)"
                  >
                    +
                  </button>
                </div>
                <span class="font-sans text-sm font-medium text-brand-olive">
                  {{ item.unitPrice != null ? formatPrice(item.unitPrice * item.quantity) : 'A consultar' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cart summary -->
      <div class="mt-8 md:flex md:justify-end">
        <div class="md:w-96">
          <div class="border-t border-brand-olive/20 pt-6">
            <!-- Subtotal (only shown when there are regular items) -->
            <template v-if="cart.hasRegularItems">
              <div class="flex items-center justify-between">
                <span class="font-sans text-sm text-brand-olive">Subtotal</span>
                <span class="font-sans text-lg font-bold text-brand-primary">{{ formatPrice(cart.regularSubtotal) }}</span>
              </div>
              <p class="font-sans text-xs text-brand-olive/50 mt-2">
                Los impuestos y el envio se calculan en el checkout
              </p>

              <NuxtLink
                to="/checkout"
                class="block w-full mt-6 py-4 bg-brand-primary text-brand-cream font-sans font-medium text-sm tracking-wide text-center hover:bg-brand-primary/90 transition-colors duration-200"
              >
                PROCEDER AL CHECKOUT
              </NuxtLink>
            </template>

            <!-- Cotización CTA -->
            <template v-if="cart.hasCotizacionItems">
              <p v-if="cart.hasRegularItems" class="font-sans text-xs text-brand-olive/50 mt-4 mb-3">
                Los productos de cotización se consultan por separado
              </p>
              <a
                :href="cart.generateCotizacionWhatsAppUrl()"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center justify-center gap-2 w-full py-4 bg-brand-olive text-brand-cream font-sans font-medium text-sm tracking-wide text-center hover:bg-brand-olive/90 transition-colors duration-200"
                :class="{ 'mt-6': !cart.hasRegularItems }"
                @click="onCotizacionSent"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.116.553 4.1 1.519 5.828L.057 23.681l5.994-1.57A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.82c-1.94 0-3.79-.508-5.417-1.467l-.388-.231-4.025 1.055 1.074-3.922-.253-.402A9.777 9.777 0 012.18 12c0-5.422 4.398-9.82 9.82-9.82 5.422 0 9.82 4.398 9.82 9.82 0 5.422-4.398 9.82-9.82 9.82z" />
                </svg>
                SOLICITAR COTIZACIÓN
              </a>
            </template>

            <NuxtLink
              to="/productos"
              class="block w-full mt-3 text-center font-sans text-sm text-brand-olive/60 hover:text-brand-primary transition-colors duration-200"
            >
              Seguir comprando
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatPrice } from '~/utils/format'

const cart = useCartStore()

function onImgError(e) {
  e.target.style.display = 'none'
}

function onCotizacionSent() {
  setTimeout(() => cart.clearCotizacionItems(), 500)
}

useHead({
  title: 'Carrito | El Gran Peon',
})
</script>
