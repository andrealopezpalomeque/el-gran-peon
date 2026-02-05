export const useApi = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase

  const get = async (endpoint) => {
    try {
      const response = await fetch(`${baseURL}${endpoint}`)
      if (!response.ok) throw new Error('Error del servidor')
      return await response.json()
    } catch (error) {
      console.error('API Error:', error)
      return null
    }
  }

  return { get }
}
