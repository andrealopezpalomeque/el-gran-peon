export default defineNuxtRouteMiddleware((to) => {
  // Public routes that don't need access guard
  const publicRoutes = ['/subscription', '/access']
  const path = to.path.replace(/\/$/, '') || '/'

  if (publicRoutes.includes(path)) {
    return
  }

  // Check if user has access (stored in cookie)
  const hasAccess = useCookie('elgranpeon-access', { default: () => false })

  if (!hasAccess.value) {
    return navigateTo('/access')
  }
})
