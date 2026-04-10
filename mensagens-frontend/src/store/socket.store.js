import { create } from 'zustand'
import { io } from 'socket.io-client'
import { useAuthStore } from './auth.store'

export const useSocketStore = create((set, get) => ({
  socket: null,
  connected: false,
  connectionError: null,

  connect: () => {
    const token = useAuthStore.getState().token
    if (!token || get().socket) return

    try {
      const socket = io(import.meta.env.VITE_API_URL, {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
      })

      socket.on('connect', () => {
        set({ connected: true, connectionError: null })
        console.log('Socket conectado')
      })

      socket.on('disconnect', () => {
        set({ connected: false })
        console.log('Socket desconectado')
      })

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message)
        set({ connectionError: error.message })
      })

      socket.on('error', (error) => {
        console.error('Socket error:', error)
      })

      set({ socket })
    } catch (error) {
      console.error('Erro ao criar socket:', error)
      set({ connectionError: error.message })
    }
  },

  disconnect: () => {
    const socket = get().socket
    if (socket) socket.disconnect()
    set({ socket: null, connected: false })
  }
}))
