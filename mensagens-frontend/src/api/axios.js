import axios from 'axios'
import { useAuthStore } from '../store/auth.store'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

// 🔹 Request: adiciona token
api.interceptors.request.use(config => {
  const token = useAuthStore.getState().token

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// 🔥 Response: tratamento de erros global
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      const { logout } = useAuthStore.getState()
      logout()
      
      // Mostrar erro via toast/alert (sem dependência de contexto)
      const message = error.response?.data?.message || 'Sessão expirada'
      alert(message)
      
      window.location.href = '/login'
      return Promise.reject(error)
    }

    const message = error.response?.data?.message || 'Erro de conexão'
    alert(message)

    return Promise.reject(error)
  }
)

export default api
