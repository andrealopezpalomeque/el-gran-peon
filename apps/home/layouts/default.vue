<template>
  <div class="min-h-dvh flex flex-col">
    <div class="sticky top-0 z-40">
      <PromoBanner />
      <SiteHeader />
    </div>
    <main class="flex-1">
      <slot />
    </main>
    <SiteFooter />
    <WhatsAppButton />
  </div>
</template>
