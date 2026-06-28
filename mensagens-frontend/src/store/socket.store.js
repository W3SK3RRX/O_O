import { create } from 'zustand'
import { io } from 'socket.io-client'
import { useAuthStore } from './auth.store'
import { useChatStore } from './chat.store'
import { useNotificationStore } from './notification.store'

export const useSocketStore = create((set, get) => ({
  socket: null,
  connected: false,
  connectionError: null,
  refreshing: false,

  connect: () => {
    const token = useAuthStore.getState().token
    if (!token || get().socket) return

    try {
      const socket = io(import.meta.env.VITE_API_URL, {
        // `auth` como função: o socket.io reavalia o token a cada tentativa de
        // (re)conexão. Sem isso, o token capturado no primeiro connect expira em
        // ~1h e toda reconexão posterior falha na autenticação, matando o socket.
        auth: (cb) => cb({ token: useAuthStore.getState().token }),
        reconnection: true,
        // Quedas de socket são frequentes (rede móvel, app em background). Nunca
        // desistir de reconectar: enquanto houver token válido, o socket volta.
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 10000,
      })

      socket.on('connect', () => {
        set({ connected: true, connectionError: null })
        console.log('Socket conectado')
      })

      socket.on('newMessage', (message) => {
        const { activeConversation, updateLastMessage, incrementUnread } = useChatStore.getState()
        const currentUserId = useAuthStore.getState().user?._id

        // Atualiza apenas a lista de conversas (preview/ordenação).
        // A inserção na conversa ativa (com descriptografia) é feita em Chat.jsx,
        // evitando dupla inserção/contagem.
        updateLastMessage(message)

        const isActiveConversation = activeConversation?._id === message.conversationId
        // Normaliza senderId (pode vir como string ou objeto populado)
        const senderId = (message.senderId?._id ?? message.senderId)?.toString()
        const isFromOther = senderId !== currentUserId?.toString()

        if (isFromOther && !isActiveConversation) {
          incrementUnread(message.conversationId)
          useNotificationStore.getState().addToast({
            title: message.senderName ?? 'Nova mensagem',
            body: 'Você recebeu uma mensagem',
            conversationId: message.conversationId,
          })
        }
      })

      socket.on('disconnect', () => {
        set({ connected: false })
        console.log('Socket desconectado')
      })

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message)
        set({ connectionError: error.message })

        // Erro de autenticação (token expirou): renova o access token uma vez.
        // Como `auth` é função, a próxima tentativa automática de reconexão já
        // usará o token novo. Erros de transporte (rede) não entram aqui — esses
        // o socket.io resolve sozinho com o backoff de reconexão.
        const msg = (error?.message || '').toLowerCase()
        const isAuthError =
          msg.includes('autorizado') ||
          msg.includes('token') ||
          msg.includes('usuário')

        if (isAuthError && !get().refreshing) {
          set({ refreshing: true })
          useAuthStore
            .getState()
            .refreshAccessToken()
            .catch(() => {
              // Refresh falhou (sessão realmente expirada): para de reconectar
              // para não martelar o servidor. O fluxo do axios cuida do logout.
              get().disconnect()
            })
            .finally(() => set({ refreshing: false }))
        }
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
    if (socket) {
      // Remove todos os listeners antes de desconectar para evitar handlers
      // acumulados em reconexões.
      socket.removeAllListeners()
      socket.disconnect()
    }
    set({ socket: null, connected: false, connectionError: null, refreshing: false })
  }
}))
