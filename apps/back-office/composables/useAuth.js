export const useAuth = () => {
  const isAuthenticated = useState('auth', () => false)
  const config = useRuntimeConfig()

  const login = (key) => {
    if (key === config.public.apiKey) {
      isAuthenticated.value = true
      return true
    }
    return false
  }

  const logout = () => {
    isAuthenticated.value = false
  }

  return { isAuthenticated, login, logout }
}
