<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="container mx-auto px-6 py-20">
      <div class="max-w-3xl mx-auto animate-pulse">
        <div class="h-3 w-48 bg-brand-olive/5 mb-4" />
        <div class="h-3 w-20 bg-brand-olive/5 mb-2" />
        <div class="h-10 w-3/4 bg-brand-olive/5 mb-2" />
        <div class="h-5 w-1/2 bg-brand-olive/5 mb-8" />
        <div class="aspect-[16/9] bg-brand-cream" />
      </div>
    </div>

    <!-- Not found -->
    <div v-else-if="!post" class="container mx-auto px-6 py-20 text-center">
      <h1 class="font-display uppercase text-brand-primary text-3xl">POST NO ENCONTRADO</h1>
      <p class="font-serif text-brand-olive/60 mt-4">El articulo que buscas no existe o fue removido.</p>
      <NuxtLink
        to="/blog"
        class="inline-block mt-6 font-sans text-sm text-brand-primary underline underline-offset-4 hover:text-brand-primary/80 transition-colors duration-200"
      >
        Ver todas las noticias
      </NuxtLink>
    </div>

    <!-- Post -->
    <div v-else>
      <!-- Hero -->
      <section class="bg-brand-cream pt-4 pb-6 md:pt-6 md:pb-8">
        <div class="container mx-auto px-6">
          <div class="max-w-3xl mx-auto">
            <UiBreadcrumb :items="breadcrumbItems" class="mb-4" />
            <span class="font-sans text-xs uppercase tracking-wide text-brand-olive/50">
              {{ post.category }}
            </span>
            <h1 class="font-display uppercase text-brand-primary text-3xl md:text-4xl mt-2">
              {{ post.title }}
            </h1>
            <p v-if="post.subtitle" class="font-serif text-brand-olive/60 text-lg mt-2">
              {{ post.subtitle }}
            </p>
          </div>
        </div>
      </section>

      <!-- Image -->
      <section class="container mx-auto px-6">
        <div class="max-w-3xl mx-auto">
          <div class="aspect-[16/9] overflow-hidden">
            <img
              :src="optimizedUrl(post.heroImage?.url, { width: 800 })"
              :alt="post.title"
              class="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <!-- Article body -->
      <article class="container mx-auto px-6 py-12 md:py-16">
        <div class="max-w-3xl mx-auto prose-article" v-html="post.body" />

        <!-- CTA -->
        <div class="max-w-3xl mx-auto mt-12 pt-8 border-t border-brand-olive/10 text-center">
          <NuxtLink
            to="/productos"
            class="inline-block bg-brand-primary text-brand-cream font-sans text-sm uppercase tracking-widest px-8 py-3 hover:bg-brand-primary/90 transition-colors duration-200"
          >
            EXPLORAR PRODUCTOS
          </NuxtLink>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
const { get } = useApi()
const route = useRoute()
const { optimizedUrl } = useCloudinaryUrl()

const post = ref(null)
const loading = ref(true)

const breadcrumbItems = computed(() => {
  if (!post.value) return []
  return [
    { label: 'Inicio', to: '/' },
    { label: 'Blog', to: '/blog' },
    { label: post.value.title, to: null },
  ]
})

onMounted(async () => {
  const data = await get(`/api/blog/${route.params.slug}`)
  post.value = data
  loading.value = false
})

useHead({
  title: computed(() => {
    if (!post.value) return 'Blog | El Gran Peon'
    return post.value.seoTitle || `${post.value.title} | El Gran Peon`
  }),
  meta: computed(() => {
    if (!post.value) return []
    const description = post.value.seoDescription || post.value.excerpt
    return [
      { name: 'description', content: description },
      { property: 'og:title', content: post.value.seoTitle || post.value.title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: post.value.heroImage?.url || '' },
    ]
  }),
})
</script>

<style scoped>
.prose-article {
  @apply font-serif text-brand-olive leading-relaxed;
}
.prose-article :deep(p) {
  @apply mb-5;
}
.prose-article :deep(h2) {
  @apply font-display uppercase text-brand-primary text-xl md:text-2xl mt-10 mb-4;
}
.prose-article :deep(h3) {
  @apply font-sans font-semibold text-brand-olive text-base mt-6 mb-2;
}
.prose-article :deep(ul) {
  @apply mb-5 ml-5 space-y-2;
}
.prose-article :deep(ol) {
  @apply mb-5 ml-5 space-y-2 list-decimal;
}
.prose-article :deep(ul > li) {
  @apply list-disc;
}
.prose-article :deep(strong) {
  @apply font-semibold text-brand-olive;
}
</style>
