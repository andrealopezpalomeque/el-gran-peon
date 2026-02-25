<template>
  <!-- Loading state -->
  <div v-if="loading" class="container mx-auto px-4 md:px-6 pt-4 pb-10 md:pt-6 md:pb-16">
    <div class="animate-pulse">
      <div class="h-3 w-48 bg-brand-olive/5 mb-6" />
      <div class="md:flex gap-10">
        <div class="md:w-1/2">
          <div class="aspect-[4/3] bg-brand-cream" />
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
        <!-- Left: Image & Video Gallery -->
        <div class="md:w-1/2">
          <!-- Main display area -->
          <div
            class="relative group aspect-[4/3] overflow-hidden"
            :class="currentGalleryItem.type === 'image' ? 'cursor-zoom-in bg-brand-cream' : 'bg-black'"
            @touchstart="onGalleryTouchStart"
            @touchend="onGalleryTouchEnd"
            @click="onGalleryClick"
          >
            <!-- Unified transition for images and videos -->
            <Transition :name="`slide-${slideDirection}`">
              <div :key="selectedGalleryIndex" class="absolute inset-0">
                <!-- Image display -->
                <template v-if="currentGalleryItem.type === 'image'">
                  <img
                    v-if="currentGalleryItem.url && !mainImgBroken"
                    :src="currentGalleryItem.url"
                    :alt="product.name"
                    class="w-full h-full object-contain"
                    @error="mainImgBroken = true"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <img src="/images/icon.png" alt="El Gran Peón" class="w-24 h-24 opacity-20" />
                  </div>
                </template>

                <!-- Video display (always thumbnail — tap opens video overlay) -->
                <template v-else-if="currentGalleryItem.type === 'video'">
                  <div class="relative w-full h-full cursor-pointer" @click.stop="openVideoOverlay(currentGalleryItem.embedId)">
                    <img
                      :src="`https://img.youtube.com/vi/${currentGalleryItem.embedId}/hqdefault.jpg`"
                      :alt="currentGalleryItem.title || 'Video'"
                      class="w-full h-full object-cover"
                    />
                    <div class="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div class="w-16 h-16 flex items-center justify-center bg-brand-primary">
                        <svg class="w-7 h-7 text-brand-cream ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </Transition>

            <!-- Carousel arrows (when multiple gallery items) -->
            <template v-if="galleryItems.length > 1">
              <button
                class="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center transition-colors duration-200"
                :class="isVideoShowing
                  ? 'bg-white/90 text-brand-olive hover:bg-white'
                  : 'bg-brand-olive/10 text-brand-olive hover:bg-brand-olive/20 md:opacity-0 md:group-hover:opacity-100'"
                @click.stop="prevMedia"
                aria-label="Anterior"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                class="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center transition-colors duration-200"
                :class="isVideoShowing
                  ? 'bg-white/90 text-brand-olive hover:bg-white'
                  : 'bg-brand-olive/10 text-brand-olive hover:bg-brand-olive/20 md:opacity-0 md:group-hover:opacity-100'"
                @click.stop="nextMedia"
                aria-label="Siguiente"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <!-- Gallery counter -->
              <span
                class="absolute bottom-3 right-3 z-10 font-sans text-xs px-2 py-1"
                :class="isVideoShowing
                  ? 'bg-white/90 text-brand-olive'
                  : 'text-white bg-brand-olive/50'"
              >
                {{ selectedGalleryIndex + 1 }} / {{ galleryItems.length }}
              </span>
            </template>

            <!-- Zoom hint icon (images only) -->
            <div v-if="currentGalleryItem.type === 'image' && currentGalleryItem.url && !mainImgBroken" class="absolute bottom-3 left-3 z-10 text-brand-olive/30 pointer-events-none">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35M11 8v6M8 11h6" />
              </svg>
            </div>
          </div>

          <!-- Thumbnails (unified: images + videos) -->
          <div
            v-if="galleryItems.length > 1"
            class="flex gap-2 mt-3 overflow-x-auto scrollbar-hide"
          >
            <button
              v-for="(item, index) in galleryItems"
              :key="index"
              class="shrink-0 w-16 h-16 overflow-hidden border-2 transition-colors duration-200 relative"
              :class="selectedGalleryIndex === index ? 'border-brand-primary' : 'border-transparent hover:border-brand-olive/20'"
              @click="goToGalleryItem(index)"
            >
              <!-- Image thumbnail -->
              <img
                v-if="item.type === 'image'"
                :src="item.url"
                :alt="`${product.name} - ${index + 1}`"
                class="w-full h-full object-cover"
                @error="onThumbError"
              />
              <!-- Video thumbnail -->
              <template v-else>
                <img
                  :src="`https://img.youtube.com/vi/${item.embedId}/mqdefault.jpg`"
                  :alt="item.title || 'Video'"
                  class="w-full h-full object-cover"
                />
                <div class="absolute inset-0 flex items-center justify-center bg-black/40">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </template>
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
          <h1
            class="font-display uppercase text-2xl md:text-3xl mt-2"
            :class="isCotizacionProduct ? 'text-brand-olive' : 'text-brand-primary'"
          >
            {{ product.name.toUpperCase() }}
          </h1>

          <!-- Price -->
          <div class="mt-4 flex items-baseline gap-3">
            <span
              v-if="product.compareAtPrice"
              class="font-sans line-through text-brand-olive/40"
            >
              {{ formatPrice(product.compareAtPrice) }}
            </span>
            <span
              class="font-sans font-bold text-2xl"
              :class="isCotizacionProduct ? 'text-brand-olive' : 'text-brand-primary'"
            >
              {{ formatPrice(hasCustomizations ? effectivePrice : product.price) }}
            </span>
            <span v-if="customizationsExtra > 0" class="font-sans text-xs text-brand-olive/40">
              +{{ formatPrice(customizationsExtra) }} personalización
            </span>
          </div>

          <!-- Free shipping badge -->
          <div v-if="product.freeShipping" class="mt-3">
            <span class="inline-block font-sans text-xs uppercase tracking-wide px-3 py-1 bg-brand-primary/10 text-brand-primary">
              Envío gratis
            </span>
          </div>

          <!-- Stock indicator -->
          <div v-if="product.stock === 0 || (!canAddToCart && product.stock > 0)" class="mt-3">
            <span class="inline-block font-sans text-xs uppercase tracking-wide px-3 py-1 bg-brand-olive/10 text-brand-olive/60">
              {{ product.stock === 0 ? 'Sin stock' : 'Stock en el carrito' }}
            </span>
          </div>
          <div v-else-if="maxQuantity > 0 && maxQuantity <= 5" class="mt-3">
            <span class="font-sans text-xs text-brand-primary">
              {{ maxQuantity === 1 ? 'Última unidad disponible' : `Últimas ${maxQuantity} unidades disponibles` }}
            </span>
          </div>

          <!-- Customization options -->
          <div v-if="hasCustomizations" class="mt-5 space-y-3">
            <div
              v-for="cust in product.customizations"
              :key="cust.id"
              :ref="el => { if (el) custFieldRefs[cust.id] = el }"
            >
              <div class="flex items-center gap-2 mb-1.5">
                <span class="font-sans text-xs uppercase tracking-wide text-brand-olive/60">
                  {{ cust.label }}
                </span>
                <span v-if="cust.required" class="text-brand-primary text-xs">*</span>
                <span v-if="custErrors[cust.id]" class="font-sans text-xs text-red-500 ml-auto">Selecciona una opcion</span>
              </div>

              <div
                class="flex flex-wrap gap-1.5"
                :class="{ 'shake': custErrors[cust.id] }"
              >
                <button
                  v-for="opt in cust.options"
                  :key="opt.value"
                  type="button"
                  @click="onSelectChange(cust, opt.value)"
                  class="px-3 py-1.5 border font-sans text-sm transition-colors duration-150"
                  :class="selectedCustomizations[cust.id]?.value === opt.value
                    ? 'border-brand-primary bg-brand-primary text-brand-cream'
                    : 'border-brand-olive/20 text-brand-olive hover:border-brand-olive/40'"
                >
                  {{ opt.value }}
                  <span v-if="opt.extraPrice > 0" class="text-xs" :class="selectedCustomizations[cust.id]?.value === opt.value ? 'text-brand-cream/70' : 'text-brand-olive/40'">
                    +{{ formatPrice(opt.extraPrice) }}
                  </span>
                </button>
              </div>

              <!-- Grabado sub-fields (inline) -->
              <template v-if="cust.id === 'grabado'">
                <div v-if="selectedCustomizations.grabado?.value === 'Iniciales'" class="mt-2 flex items-center gap-2" :class="{ 'shake': custErrors.grabado_text }">
                  <input
                    :value="grabadoText"
                    @input="onGrabadoTextInput($event)"
                    type="text"
                    maxlength="3"
                    placeholder="ABC"
                    class="w-24 px-3 py-1.5 border bg-white font-sans text-sm text-brand-olive uppercase tracking-widest text-center focus:outline-none focus:border-brand-primary transition-colors"
                    :class="custErrors.grabado_text ? 'border-red-500' : 'border-brand-olive/20'"
                  />
                  <span class="font-sans text-xs text-brand-olive/40">Hasta 3 letras</span>
                </div>

                <div v-if="selectedCustomizations.grabado?.value === 'Logo'" class="mt-2" :class="{ 'shake': custErrors.grabado_logo }">
                  <div v-if="!grabadoLogoUrl">
                    <label
                      class="inline-flex items-center gap-2 px-3 py-1.5 border font-sans text-xs text-brand-olive cursor-pointer hover:border-brand-primary transition-colors"
                      :class="[
                        uploadingLogo ? 'opacity-50 pointer-events-none' : '',
                        custErrors.grabado_logo ? 'border-red-500' : 'border-brand-olive/20',
                      ]"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                        <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                      {{ uploadingLogo ? 'Subiendo...' : 'Subir logo (PNG, JPG)' }}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        class="hidden"
                        @change="onLogoFileChange"
                        :disabled="uploadingLogo"
                      />
                    </label>
                  </div>
                  <div v-else class="flex items-center gap-2">
                    <img :src="grabadoLogoUrl" alt="Logo" class="w-10 h-10 object-contain border border-brand-olive/10" />
                    <button type="button" @click="removeGrabadoLogo" class="font-sans text-xs text-brand-primary hover:underline">Cambiar</button>
                  </div>
                  <p v-if="logoUploadError" class="font-sans text-xs text-red-500 mt-1">{{ logoUploadError }}</p>
                </div>
              </template>
            </div>
          </div>

          <!-- Cotización CTA (mayoristas / empresariales) -->
          <div v-if="isCotizacionProduct" class="mt-5">
            <a
              :href="cotizarWhatsappUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center justify-center gap-2 w-full py-3 bg-brand-olive text-brand-cream font-sans font-medium tracking-wide text-sm hover:bg-brand-olive/90 transition-colors duration-200"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.116.553 4.1 1.519 5.828L.057 23.681l5.994-1.57A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.82c-1.94 0-3.79-.508-5.417-1.467l-.388-.231-4.025 1.055 1.074-3.922-.253-.402A9.777 9.777 0 012.18 12c0-5.422 4.398-9.82 9.82-9.82 5.422 0 9.82 4.398 9.82 9.82 0 5.422-4.398 9.82-9.82 9.82z" />
              </svg>
              SOLICITAR COTIZACIÓN
            </a>
          </div>

          <!-- Regular product: Quantity selector + Add to cart -->
          <template v-else>
            <div class="mt-5 flex items-center gap-4">
              <div v-if="canAddToCart" class="flex items-center border border-brand-olive/20">
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
                  class="w-10 h-10 flex items-center justify-center font-sans text-brand-olive hover:bg-brand-olive/5 transition-colors duration-200 disabled:opacity-30"
                  :disabled="quantity >= maxQuantity"
                  @click="quantity < maxQuantity && quantity++"
                >
                  +
                </button>
              </div>
              <button
                class="flex-1 py-3 font-sans font-medium tracking-wide text-sm transition-colors duration-200"
                :class="!canAddToCart
                  ? 'bg-brand-olive/10 text-brand-olive/40 cursor-not-allowed'
                  : 'bg-brand-primary text-brand-cream hover:bg-brand-primary/90'"
                :disabled="!canAddToCart"
                @click="addToCart"
              >
                {{ product.stock === 0 ? 'SIN STOCK' : !canAddToCart ? 'STOCK EN EL CARRITO' : 'AGREGAR AL CARRITO' }}
              </button>
            </div>

            <!-- Success message -->
            <p v-if="added" class="mt-3 text-green-700 font-sans text-sm">
              Producto agregado al carrito
            </p>

            <!-- Bulk section -->
            <div v-if="product.bulkAvailable" class="mt-4">
              <a
                :href="bulkWhatsappUrl"
                target="_blank"
                rel="noopener"
                class="inline-flex items-center gap-2 font-sans text-sm text-brand-primary hover:text-brand-primary/80 transition-colors duration-200"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.116.553 4.1 1.519 5.828L.057 23.681l5.994-1.57A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.82c-1.94 0-3.79-.508-5.417-1.467l-.388-.231-4.025 1.055 1.074-3.922-.253-.402A9.777 9.777 0 012.18 12c0-5.422 4.398-9.82 9.82-9.82 5.422 0 9.82 4.398 9.82 9.82 0 5.422-4.398 9.82-9.82 9.82z" />
                </svg>
                ¿Comprás en cantidad? Consultanos por WhatsApp
              </a>
            </div>
          </template>

          <!-- Description -->
          <div
            v-if="product.description"
            class="border-t border-brand-olive/10 mt-6 pt-6 font-serif text-brand-olive leading-relaxed prose-product"
            v-html="product.description"
          />
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

    <!-- Lightbox / Zoom overlay -->
    <Teleport to="body">
      <Transition name="lightbox">
        <div
          v-if="lightboxOpen"
          class="fixed inset-0 z-50 bg-black/95"
          @wheel.prevent="onLightboxWheel"
          @mouseup="onLightboxMouseUp"
          @mousemove="onLightboxMouseMove"
          @mouseleave="onLightboxMouseUp"
        >
          <!-- Close button -->
          <button
            class="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            @click="closeLightbox"
            aria-label="Cerrar"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Image container -->
          <div
            class="relative w-full h-full select-none overflow-hidden"
            :class="zoomLevel > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'"
            @touchstart="onLightboxTouchStart"
            @touchmove.prevent="onLightboxTouchMove"
            @touchend="onLightboxTouchEnd"
            @mousedown="onLightboxMouseDown"
            @dblclick="onLightboxDblClick"
          >
            <Transition :name="`slide-${slideDirection}`">
              <div
                :key="selectedImageIndex"
                class="absolute inset-0 flex items-center justify-center"
              >
                <img
                  v-if="mainImage"
                  :src="mainImage"
                  :alt="product.name"
                  class="max-w-full max-h-full object-contain select-none"
                  :class="{ 'transition-transform duration-150 ease-out': !isInteracting }"
                  :style="{ transform: `scale(${zoomLevel}) translate(${panX}px, ${panY}px)` }"
                  draggable="false"
                />
              </div>
            </Transition>
          </div>

          <!-- Navigation arrows -->
          <template v-if="product.images && product.images.length > 1">
            <button
              class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
              @click="lightboxPrev"
              aria-label="Imagen anterior"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
              @click="lightboxNext"
              aria-label="Imagen siguiente"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </template>

          <!-- Thumbnail gallery -->
          <div v-if="product.images && product.images.length > 1" class="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 max-w-[80vw] overflow-x-auto scrollbar-hide px-2">
            <button
              v-for="(img, index) in product.images"
              :key="index"
              class="shrink-0 w-14 h-14 overflow-hidden border-2 transition-colors duration-200"
              :class="selectedImageIndex === index ? 'border-white' : 'border-transparent hover:border-white/40 opacity-50 hover:opacity-80'"
              @click="lightboxGoTo(index)"
            >
              <img
                :src="img.url"
                :alt="`${product.name} - ${index + 1}`"
                class="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Video overlay -->
    <Teleport to="body">
      <Transition name="lightbox">
        <div
          v-if="videoOverlayId"
          class="fixed inset-0 z-50 bg-black flex items-center justify-center"
          @click.self="closeVideoOverlay"
        >
          <!-- Close button -->
          <button
            class="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            @click="closeVideoOverlay"
            aria-label="Cerrar video"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Iframe — full viewport, no overlays competing for touch -->
          <iframe
            :src="`https://www.youtube.com/embed/${videoOverlayId}?rel=0&autoplay=1`"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            class="w-full h-full max-w-4xl max-h-[80vh]"
          />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
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
const added = ref(false)
const cart = useCartStore()

// ─── Customizations ───
const selectedCustomizations = ref({})

// Initialize customization defaults when product loads
function initCustomizationDefaults() {
  if (!product.value?.customizations?.length) {
    selectedCustomizations.value = {}
    return
  }
  const defaults = {}
  for (const cust of product.value.customizations) {
    if (cust.options?.length && cust.required) {
      defaults[cust.id] = {
        label: cust.label,
        value: cust.options[0].value,
        extraPrice: cust.options[0].extraPrice || 0,
      }
    }
  }
  selectedCustomizations.value = defaults
}

const customizationsExtra = computed(() => {
  return Object.values(selectedCustomizations.value).reduce((sum, c) => sum + (c.extraPrice || 0), 0)
})

const effectivePrice = computed(() => {
  if (!product.value) return 0
  return product.value.price + customizationsExtra.value
})

const hasCustomizations = computed(() => {
  return product.value?.customizations?.length > 0
})

function onSelectChange(cust, value) {
  // Toggle off: clicking the already-selected option on an optional customization deselects it
  if (!cust.required && selectedCustomizations.value[cust.id]?.value === value) {
    delete selectedCustomizations.value[cust.id]
    if (cust.id === 'grabado') {
      grabadoText.value = ''
      grabadoLogoUrl.value = ''
      logoUploadError.value = ''
      delete custErrors.value.grabado_text
      delete custErrors.value.grabado_logo
    }
    return
  }

  const opt = cust.options.find(o => o.value === value)
  selectedCustomizations.value[cust.id] = {
    label: cust.label,
    value: value,
    extraPrice: opt?.extraPrice || 0,
  }
  // Clear error for this field
  delete custErrors.value[cust.id]
  // Reset grabado sub-fields when switching option
  if (cust.id === 'grabado') {
    grabadoText.value = ''
    grabadoLogoUrl.value = ''
    logoUploadError.value = ''
    delete custErrors.value.grabado_text
    delete custErrors.value.grabado_logo
  }
}

// ─── Grabado sub-fields ───
const grabadoText = ref('')
const grabadoLogoUrl = ref('')
const uploadingLogo = ref(false)
const logoUploadError = ref('')

function onGrabadoTextInput(event) {
  const cleaned = event.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3)
  grabadoText.value = cleaned
  event.target.value = cleaned
  if (selectedCustomizations.value.grabado) {
    selectedCustomizations.value.grabado.text = grabadoText.value
  }
  if (grabadoText.value) delete custErrors.value.grabado_text
}

async function onLogoFileChange(event) {
  const file = event.target.files?.[0]
  if (!file) return

  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    logoUploadError.value = 'El archivo es muy grande (max 5MB)'
    return
  }

  uploadingLogo.value = true
  logoUploadError.value = ''

  try {
    const config = useRuntimeConfig()
    const formData = new FormData()
    formData.append('image', file)

    const response = await fetch(`${config.public.apiBase}/api/upload/customer-logo`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) throw new Error('Error al subir imagen')

    const data = await response.json()
    grabadoLogoUrl.value = data.url

    if (selectedCustomizations.value.grabado) {
      selectedCustomizations.value.grabado.logoUrl = data.url
    }
    delete custErrors.value.grabado_logo
  } catch (err) {
    logoUploadError.value = 'Error al subir la imagen. Intenta de nuevo.'
    console.error('Logo upload error:', err)
  } finally {
    uploadingLogo.value = false
    event.target.value = ''
  }
}

function removeGrabadoLogo() {
  grabadoLogoUrl.value = ''
  if (selectedCustomizations.value.grabado) {
    delete selectedCustomizations.value.grabado.logoUrl
  }
}

// Max quantity the user can select, accounting for ALL cart items for same productId
const maxQuantity = computed(() => {
  if (!product.value) return 0
  if (product.value.stock === -1) return 99
  if (product.value.stock === 0) return 0
  const alreadyInCart = cart.getProductTotalQuantity(product.value.id)
  return product.value.stock - alreadyInCart
})

const canAddToCart = computed(() => maxQuantity.value > 0)

// Customization validation errors (shown on submit attempt, not by disabling button)
const custErrors = ref({})
const custFieldRefs = {}

function validateCustomizations() {
  const errors = {}
  if (!hasCustomizations.value) return errors

  for (const cust of product.value.customizations) {
    if (!cust.required) continue
    const sel = selectedCustomizations.value[cust.id]
    if (!sel || !sel.value) {
      errors[cust.id] = true
    }
  }

  // Validate grabado sub-fields
  const grabado = selectedCustomizations.value.grabado
  if (grabado) {
    if (grabado.value === 'Iniciales' && !grabadoText.value) {
      errors.grabado_text = true
    }
    if (grabado.value === 'Logo' && !grabadoLogoUrl.value) {
      errors.grabado_logo = true
    }
  }

  return errors
}

function scrollToFirstCustError(errors) {
  // Find the first customization with an error and scroll to it
  const errorKeys = Object.keys(errors)
  for (const key of errorKeys) {
    // For grabado sub-fields, scroll to the grabado field
    const fieldKey = key.startsWith('grabado') ? 'grabado' : key
    const el = custFieldRefs[fieldKey]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
  }
}

const addToCart = () => {
  if (!product.value || !canAddToCart.value) return

  // Validate customizations
  const errors = validateCustomizations()
  if (Object.keys(errors).length > 0) {
    custErrors.value = errors
    nextTick(() => scrollToFirstCustError(errors))
    // Auto-clear errors after animation
    setTimeout(() => { custErrors.value = {} }, 2000)
    return
  }

  const cappedQty = Math.min(quantity.value, maxQuantity.value)
  const hasSelectedCustomizations = Object.keys(selectedCustomizations.value).length > 0
  const custs = hasSelectedCustomizations ? { ...selectedCustomizations.value } : null
  cart.addProduct(product.value, cappedQty, custs)
  quantity.value = 1
  // Reset customizations to defaults
  grabadoText.value = ''
  grabadoLogoUrl.value = ''
  logoUploadError.value = ''
  initCustomizationDefaults()
  added.value = true
  setTimeout(() => { added.value = false }, 2000)
}

function onThumbError(e) {
  e.target.src = '/images/icon.png'
  e.target.classList.remove('object-cover')
  e.target.classList.add('object-contain', 'p-2', 'opacity-20')
}

// ─── Unified gallery (images + videos as one sequence) ───
const galleryItems = computed(() => {
  const items = []
  if (product.value?.images?.length) {
    product.value.images.forEach((img, i) => {
      items.push({ type: 'image', url: img.url, imageIndex: i })
    })
  }
  if (product.value?.videos?.length) {
    product.value.videos.forEach((vid) => {
      items.push({ type: 'video', embedId: vid.embedId, title: vid.title || '' })
    })
  }
  return items
})

const selectedGalleryIndex = ref(0)

const currentGalleryItem = computed(() => {
  return galleryItems.value[selectedGalleryIndex.value] || { type: 'image', url: '' }
})

const isVideoShowing = computed(() => currentGalleryItem.value.type === 'video')

// Video overlay — opens full-screen so iframe has no touch conflicts
const videoOverlayId = ref(null)

function openVideoOverlay(embedId) {
  videoOverlayId.value = embedId
  document.body.style.overflow = 'hidden'
}

function closeVideoOverlay() {
  videoOverlayId.value = null
  document.body.style.overflow = ''
}

const slideDirection = ref('left')

// mainImage: used by the lightbox (image-only context)
const mainImage = computed(() => {
  if (product.value?.images?.length) {
    return product.value.images[selectedImageIndex.value]?.url || product.value.images[0].url
  }
  return null
})

function goToGalleryItem(index) {
  if (index === selectedGalleryIndex.value) return
  slideDirection.value = index > selectedGalleryIndex.value ? 'left' : 'right'
  mainImgBroken.value = false
  selectedGalleryIndex.value = index
  // Sync selectedImageIndex for lightbox when landing on an image
  const item = galleryItems.value[index]
  if (item?.type === 'image') {
    selectedImageIndex.value = item.imageIndex
  }
}

function prevMedia() {
  if (galleryItems.value.length <= 1) return
  mainImgBroken.value = false
  slideDirection.value = 'right'
  const newIndex = selectedGalleryIndex.value > 0
    ? selectedGalleryIndex.value - 1
    : galleryItems.value.length - 1
  selectedGalleryIndex.value = newIndex
  const item = galleryItems.value[newIndex]
  if (item?.type === 'image') {
    selectedImageIndex.value = item.imageIndex
  }
}

function nextMedia() {
  if (galleryItems.value.length <= 1) return
  mainImgBroken.value = false
  slideDirection.value = 'left'
  const newIndex = selectedGalleryIndex.value < galleryItems.value.length - 1
    ? selectedGalleryIndex.value + 1
    : 0
  selectedGalleryIndex.value = newIndex
  const item = galleryItems.value[newIndex]
  if (item?.type === 'image') {
    selectedImageIndex.value = item.imageIndex
  }
}

// Image-only navigation (for lightbox)
function prevImage() {
  if (!product.value?.images?.length) return
  mainImgBroken.value = false
  slideDirection.value = 'right'
  selectedImageIndex.value = selectedImageIndex.value > 0
    ? selectedImageIndex.value - 1
    : product.value.images.length - 1
}

function nextImage() {
  if (!product.value?.images?.length) return
  mainImgBroken.value = false
  slideDirection.value = 'left'
  selectedImageIndex.value = selectedImageIndex.value < product.value.images.length - 1
    ? selectedImageIndex.value + 1
    : 0
}

function goToImage(index) {
  if (index === selectedImageIndex.value) return
  slideDirection.value = index > selectedImageIndex.value ? 'left' : 'right'
  mainImgBroken.value = false
  selectedImageIndex.value = index
}

// ─── Gallery touch swipe ───
const galleryTouchStartX = ref(0)
const galleryTouchStartY = ref(0)
const wasSwiped = ref(false)

function onGalleryTouchStart(e) {
  if (e.touches.length !== 1) return
  galleryTouchStartX.value = e.touches[0].clientX
  galleryTouchStartY.value = e.touches[0].clientY
  wasSwiped.value = false
}

function onGalleryTouchEnd(e) {
  const dx = e.changedTouches[0].clientX - galleryTouchStartX.value
  const dy = e.changedTouches[0].clientY - galleryTouchStartY.value
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
    wasSwiped.value = true
    if (dx > 0) prevMedia()
    else nextMedia()
  }
}

function onGalleryClick() {
  if (!wasSwiped.value && currentGalleryItem.value.type === 'image' && currentGalleryItem.value.url && !mainImgBroken.value) {
    openLightbox()
  }
}

// ─── Lightbox / Zoom ───
const lightboxOpen = ref(false)
const zoomLevel = ref(1)
const panX = ref(0)
const panY = ref(0)
const isInteracting = ref(false)

let pinchStartDist = 0
let pinchStartZoom = 1
let lastTap = 0
let activeTouches = 0
let panStartX = 0
let panStartY = 0
let panStartPanX = 0
let panStartPanY = 0
let isMousePanning = false
let mouseStartX = 0
let mouseStartY = 0
let mousePanStartX = 0
let mousePanStartY = 0

function openLightbox() {
  lightboxOpen.value = true
  zoomLevel.value = 1
  panX.value = 0
  panY.value = 0
  document.body.style.overflow = 'hidden'
}

function closeLightbox() {
  lightboxOpen.value = false
  zoomLevel.value = 1
  panX.value = 0
  panY.value = 0
  isInteracting.value = false
  document.body.style.overflow = ''
}

function resetZoom() {
  isInteracting.value = false
  zoomLevel.value = 1
  panX.value = 0
  panY.value = 0
}

function lightboxPrev() {
  mainImgBroken.value = false
  prevImage()
  resetZoom()
}

function lightboxNext() {
  mainImgBroken.value = false
  nextImage()
  resetZoom()
}

function lightboxGoTo(index) {
  if (index === selectedImageIndex.value) return
  slideDirection.value = index > selectedImageIndex.value ? 'left' : 'right'
  mainImgBroken.value = false
  selectedImageIndex.value = index
  resetZoom()
}

// Mouse wheel zoom
function onLightboxWheel(e) {
  const delta = e.deltaY > 0 ? -0.3 : 0.3
  const newZoom = Math.max(1, Math.min(4, zoomLevel.value + delta))
  zoomLevel.value = newZoom
  if (newZoom === 1) { panX.value = 0; panY.value = 0 }
}

// Double-click zoom (desktop)
function onLightboxDblClick() {
  if (zoomLevel.value > 1) resetZoom()
  else { zoomLevel.value = 2.5; panX.value = 0; panY.value = 0 }
}

// Touch handlers for lightbox
function onLightboxTouchStart(e) {
  activeTouches = e.touches.length
  if (e.touches.length === 2) {
    isInteracting.value = true
    pinchStartDist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    )
    pinchStartZoom = zoomLevel.value
  } else if (e.touches.length === 1) {
    // Double-tap detection
    const now = Date.now()
    if (now - lastTap < 300) {
      if (zoomLevel.value > 1) resetZoom()
      else { zoomLevel.value = 2.5; panX.value = 0; panY.value = 0 }
      lastTap = 0
      return
    }
    lastTap = now
    // Always track start position for swipe detection
    panStartX = e.touches[0].clientX
    panStartY = e.touches[0].clientY
    // Pan start (when zoomed)
    if (zoomLevel.value > 1) {
      isInteracting.value = true
      panStartPanX = panX.value
      panStartPanY = panY.value
    }
  }
}

function onLightboxTouchMove(e) {
  if (e.touches.length === 2) {
    const dist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    )
    const newZoom = Math.max(1, Math.min(4, pinchStartZoom * (dist / pinchStartDist)))
    zoomLevel.value = newZoom
    if (newZoom === 1) { panX.value = 0; panY.value = 0 }
  } else if (e.touches.length === 1 && zoomLevel.value > 1 && activeTouches === 1) {
    const dx = e.touches[0].clientX - panStartX
    const dy = e.touches[0].clientY - panStartY
    panX.value = panStartPanX + dx / zoomLevel.value
    panY.value = panStartPanY + dy / zoomLevel.value
  }
}

function onLightboxTouchEnd(e) {
  // Swipe navigation when at 1x zoom
  if (zoomLevel.value <= 1 && activeTouches === 1 && e.changedTouches.length) {
    const dx = e.changedTouches[0].clientX - panStartX
    const dy = e.changedTouches[0].clientY - panStartY
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx > 0) lightboxPrev()
      else lightboxNext()
    }
  }
  activeTouches = 0
  isInteracting.value = false
}

// Mouse pan in lightbox
function onLightboxMouseDown(e) {
  if (zoomLevel.value <= 1) return
  isMousePanning = true
  isInteracting.value = true
  mouseStartX = e.clientX
  mouseStartY = e.clientY
  mousePanStartX = panX.value
  mousePanStartY = panY.value
  e.preventDefault()
}

function onLightboxMouseMove(e) {
  if (!isMousePanning) return
  panX.value = mousePanStartX + (e.clientX - mouseStartX) / zoomLevel.value
  panY.value = mousePanStartY + (e.clientY - mouseStartY) / zoomLevel.value
}

function onLightboxMouseUp() {
  isMousePanning = false
  isInteracting.value = false
}

// Keyboard navigation in lightbox + video overlay
function onKeyDown(e) {
  if (videoOverlayId.value && e.key === 'Escape') {
    closeVideoOverlay()
    return
  }
  if (!lightboxOpen.value) return
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowLeft') lightboxPrev()
  if (e.key === 'ArrowRight') lightboxNext()
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

const COTIZACION_CATEGORIES = ['mayoristas', 'empresariales']

const isCotizacionProduct = computed(() => {
  if (!product.value) return false
  const parent = product.value.parentCategoryName?.toLowerCase()
  const category = product.value.categoryName?.toLowerCase()
  return COTIZACION_CATEGORIES.includes(parent) || (!parent && COTIZACION_CATEGORIES.includes(category))
})

const cotizarWhatsappUrl = computed(() => {
  if (!product.value) return '#'
  const price = formatPrice(product.value.price)
  const message = `Hola! Quiero solicitar cotización de: ${product.value.name} (${price})`
  return `https://wa.me/543794007759?text=${encodeURIComponent(message)}`
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
  document.addEventListener('keydown', onKeyDown)
  // Fetch categories and product in parallel
  const [_, __] = await Promise.all([fetchCategories(), fetchProduct()])
  if (product.value) {
    initCustomizationDefaults()
    await fetchRelatedProducts()
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeyDown)
  document.body.style.overflow = ''
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
/* Gallery slide transitions */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.35s ease-out, opacity 0.35s ease-out;
}
.slide-left-enter-from {
  transform: translateX(30%);
  opacity: 0;
}
.slide-left-leave-to {
  transform: translateX(-30%);
  opacity: 0;
}
.slide-right-enter-from {
  transform: translateX(-30%);
  opacity: 0;
}
.slide-right-leave-to {
  transform: translateX(30%);
  opacity: 0;
}
.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.2s ease;
}
.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}
/* Shake animation for validation errors */
.shake {
  animation: shake 0.4s ease-in-out;
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}
/* Product description rich text */
.prose-product :deep(p) {
  margin-bottom: 0.75em;
}
.prose-product :deep(p:last-child) {
  margin-bottom: 0;
}
.prose-product :deep(p:empty) {
  margin-bottom: 0.5em;
  min-height: 0.75em;
}
.prose-product :deep(strong) {
  font-weight: 700;
}
.prose-product :deep(em) {
  font-style: italic;
}
</style>
