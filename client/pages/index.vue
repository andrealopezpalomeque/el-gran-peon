<template>
  <div class="relative">
    <!-- Full-bleed background that covers safe areas -->
    <div class="fixed inset-0 -top-[100px] -bottom-[100px] -left-[50px] -right-[50px] z-0">
      <div
        class="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style="background-image: url('/images/hero.jpg');"
      ></div>
      <div class="absolute inset-0 bg-black/50"></div>
    </div>

    <LandingHeader />
    <LandingHero />
    <LandingFooter />
  </div>
</template>
