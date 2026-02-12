import { io } from 'socket.io-client'
import { useAuthStore } from '../store/auth.store'

let socket = null

export const connectSocket = () => {
  const token = useAuthStore.getState().token

  socket = io(import.meta.env.VITE_API_URL, {
    auth: { token }
  })

  return socket
}

export const getSocket = () => socket
