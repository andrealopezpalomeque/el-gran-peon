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

  const post = async (endpoint, data) => {
    try {
      const response = await fetch(`${baseURL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Error del servidor')
      }
      return await response.json()
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  return { get, post }
}
