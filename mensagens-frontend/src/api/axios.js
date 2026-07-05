import axios from 'axios'
import { useAuthStore } from '../store/auth.store'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  // Envia o cookie httpOnly de refresh nas chamadas a /auth/refresh e /auth/logout.
  withCredentials: true,
})

// 🔹 Request: adiciona o access token (em memória) no header
api.interceptors.request.use(config => {
  const token = useAuthStore.getState().token

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

const forceLogout = () => {
  useAuthStore.getState().logout()
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

// 🔥 Response: renova o token em 401 e propaga os demais erros (sem alert global)
api.interceptors.response.use(
  response => response,
  async error => {
    const original = error.config
    const status = error.response?.status
    const isAuthCall = original?.url?.includes('/auth/refresh') || original?.url?.includes('/auth/logout')

    // 401 em requisição normal → tenta renovar o token uma vez e refaz a requisição
    if (status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true

      try {
        // O single-flight vive no store: chamadas concorrentes compartilham a
        // mesma promise de refresh (usa o cookie httpOnly, sem body).
        const newToken = await useAuthStore.getState().refreshAccessToken()
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch (refreshError) {
        forceLogout()
        return Promise.reject(refreshError)
      }
    }

    // O próprio refresh falhou (sessão realmente expirada) → desloga
    if (status === 401 && original?.url?.includes('/auth/refresh')) {
      forceLogout()
    }

    return Promise.reject(error)
  }
)

export default api
