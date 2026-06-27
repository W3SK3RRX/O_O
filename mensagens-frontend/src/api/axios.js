import axios from 'axios'
import { useAuthStore } from '../store/auth.store'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
})

// 🔹 Request: adiciona token
api.interceptors.request.use(config => {
  const token = useAuthStore.getState().token

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// Single-flight: garante uma única chamada de refresh concorrente
let refreshPromise = null

const forceLogout = () => {
  useAuthStore.getState().logout()
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

// 🔥 Response: renova token em 401 e propaga os demais erros (sem alert global)
api.interceptors.response.use(
  response => response,
  async error => {
    const original = error.config
    const status = error.response?.status
    const isRefreshCall = original?.url?.includes('/auth/refresh')

    // 401 em requisição normal → tenta renovar o token uma vez e refaz a requisição
    if (status === 401 && original && !original._retry && !isRefreshCall) {
      original._retry = true

      try {
        if (!refreshPromise) {
          refreshPromise = useAuthStore.getState()
            .refreshAccessToken()
            .finally(() => { refreshPromise = null })
        }

        const newToken = await refreshPromise
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch (refreshError) {
        forceLogout()
        return Promise.reject(refreshError)
      }
    }

    // O próprio refresh falhou (refresh token expirado/inválido) → desloga
    if (status === 401 && isRefreshCall) {
      forceLogout()
    }

    return Promise.reject(error)
  }
)

export default api
