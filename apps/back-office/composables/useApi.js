export const useApi = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase
  const apiKey = config.public.apiKey

  const apiFetch = async (endpoint, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (apiKey) {
      headers['x-api-key'] = apiKey
    }

    try {
      const response = await fetch(`${baseURL}${endpoint}`, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error del servidor')
      }

      return data
    } catch (error) {
      throw error
    }
  }

  return {
    get: (endpoint) => apiFetch(endpoint),
    post: (endpoint, body) => apiFetch(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint, body) => apiFetch(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    patch: (endpoint, body) => apiFetch(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (endpoint) => apiFetch(endpoint, { method: 'DELETE' }),
    upload: async (endpoint, formData) => {
      const response = await fetch(`${baseURL}${endpoint}`, {
        method: 'POST',
        headers: { 'x-api-key': apiKey },
        body: formData,
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Error al subir imagen')
      return data
    },
  }
}
