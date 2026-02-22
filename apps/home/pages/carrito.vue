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
                {{ formatPrice(item.unitPrice) }}
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
                {{ formatPrice(item.unitPrice * item.quantity) }}
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

              <p class="font-sans text-sm text-brand-olive mt-2">{{ formatPrice(item.unitPrice) }}</p>

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
                  {{ formatPrice(item.unitPrice * item.quantity) }}
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
            <div class="flex items-center justify-between">
              <span class="font-sans text-sm text-brand-olive">Subtotal</span>
              <span class="font-sans text-lg font-bold text-brand-primary">{{ formatPrice(cart.subtotal) }}</span>
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

useHead({
  title: 'Carrito | El Gran Peon',
})
</script>
