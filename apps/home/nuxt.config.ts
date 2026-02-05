export default defineNuxtConfig({
  compatibilityDate: '2025-01-16',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      htmlAttrs: {
        lang: 'es',
      },
      title: 'El Gran Peón | Herencia Clásica — Hecho para durar. Como las cosas bien hechas',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: 'Hecho para durar. Como las cosas bien hechas.' },
        { name: 'theme-color', content: '#741617' },
        // Open Graph (Facebook, LinkedIn, WhatsApp)
        { property: 'og:title', content: 'El Gran Peón | Herencia Clásica' },
        { property: 'og:description', content: 'Hecho para durar. Como las cosas bien hechas.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://elgranpeon.com' },
        { property: 'og:image', content: 'https://elgranpeon.com/images/og-image.jpg?v=4' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:locale', content: 'es_AR' },
        { property: 'og:site_name', content: 'El Gran Peón' },
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'El Gran Peón | Herencia Clásica' },
        { name: 'twitter:description', content: 'Hecho para durar. Como las cosas bien hechas.' },
        { name: 'twitter:image', content: 'https://elgranpeon.com/images/og-image.jpg?v=4' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      ],
    },
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001',
      firebaseApiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID,
    },
  },
})
