<template>
  <div>
    <section class="bg-brand-cream pt-4 pb-6 md:pt-6 md:pb-8">
      <div class="container mx-auto px-6">
        <div class="max-w-6xl mx-auto">
          <UiBreadcrumb :items="[{ label: 'Inicio', to: '/' }, { label: 'Blog', to: null }]" class="mb-4" />
          <h1 class="font-display uppercase text-brand-primary text-3xl md:text-4xl">
            NOTICIAS E HISTORIAS
          </h1>
          <div class="mt-4 h-px w-12 bg-brand-primary/30" />
        </div>
      </div>
    </section>

    <section class="container mx-auto px-6 py-12 md:py-16">
      <div class="max-w-6xl mx-auto">
        <!-- Loading -->
        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="i in 3" :key="i" class="animate-pulse">
            <div class="aspect-[4/3] bg-brand-cream" />
            <div class="mt-4 h-3 w-20 bg-brand-olive/5" />
            <div class="mt-2 h-5 w-3/4 bg-brand-olive/5" />
            <div class="mt-2 h-12 w-full bg-brand-olive/5" />
          </div>
        </div>

        <!-- Empty -->
        <div v-else-if="posts.length === 0" class="text-center py-12">
          <p class="font-serif text-brand-olive/60">No hay noticias por el momento.</p>
        </div>

        <!-- Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <NuxtLink
            v-for="post in posts"
            :key="post.id"
            :to="`/blog/${post.slug}`"
            class="group block"
          >
            <div class="aspect-[4/3] bg-white border border-brand-olive/10 overflow-hidden">
              <img
                v-if="post.heroImage?.url"
                :src="post.heroImage.url"
                :alt="post.title"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div class="mt-5">
              <span class="font-sans text-xs uppercase tracking-wide text-brand-olive/50">
                {{ post.category }}
              </span>
              <h2 class="font-sans font-medium text-brand-olive text-lg mt-1 group-hover:text-brand-primary transition-colors">
                {{ post.title }}
              </h2>
              <p class="font-serif text-brand-olive/60 text-sm mt-2 leading-relaxed line-clamp-3">
                {{ post.excerpt }}
              </p>
              <span class="inline-block mt-3 font-sans text-sm text-brand-primary border-b border-brand-primary/30 group-hover:border-brand-primary/60 transition-colors">
                Leer mas
              </span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
const { get } = useApi()

const posts = ref([])
const loading = ref(true)

onMounted(async () => {
  const data = await get('/api/blog')
  posts.value = data?.posts || []
  loading.value = false
})

useSeoMeta({
  title: 'Noticias e Historias | El Gran Peon',
  description: 'Noticias, lanzamientos e historias de El Gran Peon. Articulos sobre tradicion, oficio y productos artesanales argentinos.',
  ogTitle: 'Noticias e Historias | El Gran Peon',
  ogDescription: 'Noticias, lanzamientos e historias de El Gran Peon.',
})
</script>
