export default defineNuxtRouteMiddleware((to) => {
  // Skip on server — sessionStorage only exists in the browser
  if (import.meta.server) return

  const { isAuthenticated } = useAuth()

  // Hydrate from sessionStorage if useState lost the value (e.g. page refresh)
  if (!isAuthenticated.value && sessionStorage.getItem('auth') === 'true') {
    isAuthenticated.value = true
  }

  if (to.path === '/login') {
    if (isAuthenticated.value) return navigateTo('/')
    return
  }

  if (!isAuthenticated.value) return navigateTo('/login')
})
