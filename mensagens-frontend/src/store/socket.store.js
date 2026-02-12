import { create } from 'zustand'
import { io } from 'socket.io-client'
import { useAuthStore } from './auth.store'

export const useSocketStore = create((set, get) => ({
  socket: null,
  connected: false,

  connect: () => {
    const token = useAuthStore.getState().token
    if (!token || get().socket) return

    const socket = io(import.meta.env.VITE_API_URL, {
      auth: { token }
    })

    socket.on('connect', () => {
      set({ connected: true })
      console.log('Socket conectado')
    })

    socket.on('disconnect', () => {
      set({ connected: false })
      console.log('Socket desconectado')
    })

    set({ socket })
  },

  disconnect: () => {
    const socket = get().socket
    if (socket) socket.disconnect()
    set({ socket: null, connected: false })
  }
}))
