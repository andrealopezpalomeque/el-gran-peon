export default defineNuxtRouteMiddleware((to) => {
  // Public routes that don't need access guard
  const publicRoutes = ['/subscription', '/access']

  if (publicRoutes.includes(to.path)) {
    return
  }

  // Check if user has access (stored in cookie)
  const hasAccess = useCookie('elgranpeon-access', { default: () => false })

  if (!hasAccess.value) {
    return navigateTo('/access')
  }
})
