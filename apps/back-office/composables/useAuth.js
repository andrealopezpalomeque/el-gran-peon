export const useAuth = () => {
  const isAuthenticated = useState('auth', () => {
    if (import.meta.client) {
      return sessionStorage.getItem('auth') === 'true'
    }
    return false
  })
  const config = useRuntimeConfig()

  const login = (key) => {
    if (key === config.public.apiKey) {
      isAuthenticated.value = true
      if (import.meta.client) sessionStorage.setItem('auth', 'true')
      return true
    }
    return false
  }

  const logout = () => {
    isAuthenticated.value = false
    if (import.meta.client) sessionStorage.removeItem('auth')
  }

  return { isAuthenticated, login, logout }
}
