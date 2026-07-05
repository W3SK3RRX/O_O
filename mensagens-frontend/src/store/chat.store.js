import { create } from 'zustand'
import { getConversations, getMessagesPage } from '../api/chat.api'
import { encryptMessage } from '../crypto/message'
import { loadConversationKey } from '../crypto/conv-storage'
import { importConversationKey } from '../crypto/conversation'
import { savePreview, loadAllPreviews } from '../crypto/preview-storage'

export const useChatStore = create((set, get) => ({
  conversations: [],
  messages: [],
  activeConversation: null,
  loading: false,
  error: null,
  pagination: null,
  unreadCounts: {},
  previews: {},          // { conversationId: textoDecifrado } — cache local do preview
  lastReadAts: {},       // { conversationId: ISO } — para ancorar "novas mensagens"
  messagesPagination: null,
  loadingOlder: false,

  setActiveConversation: (conversation) => {
    set({ activeConversation: conversation })
  },

  incrementUnread: (conversationId) =>
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [conversationId]: (state.unreadCounts[conversationId] ?? 0) + 1,
      },
    })),

  clearUnread: (conversationId) =>
    set((state) => {
      const next = { ...state.unreadCounts };
      delete next[conversationId];
      return { unreadCounts: next };
    }),

  // Preview local (texto decifrado da última mensagem) — persistido no IndexedDB.
  setPreview: (conversationId, text) => {
    set((state) => ({ previews: { ...state.previews, [conversationId]: text } }))
    savePreview(conversationId, text).catch(() => {})
  },

  loadPreviews: async () => {
    try {
      const previews = await loadAllPreviews()
      set((state) => ({ previews: { ...previews, ...state.previews } }))
    } catch {
      // cache de preview é best-effort
    }
  },

  fetchConversations: async () => {
    set({ loading: true, error: null })
    try {
      const data = await getConversations()
      // Servidor é a fonte de verdade das não lidas: reconstrói o mapa a partir
      // do unreadCount de cada conversa (sobrevive a reload/troca de dispositivo).
      const unreadCounts = {}
      const lastReadAts = {}
      for (const conv of data) {
        if (conv.unreadCount > 0) unreadCounts[conv._id] = conv.unreadCount
        if (conv.myLastReadAt) lastReadAts[conv._id] = conv.myLastReadAt
      }
      set({ conversations: data, unreadCounts, lastReadAts, loading: false, error: null })
      get().loadPreviews()
    } catch (error) {
      console.error("Erro ao buscar conversas:", error)
      // Não zera a lista já carregada numa falha transitória (rede/cold-open):
      // preserva o que existe e sinaliza o erro para a UI oferecer "tentar de novo".
      set({ loading: false, error: error?.message || 'Erro ao buscar conversas' })
    }
  },

  fetchMessages: async conversationId => {
    set({ loading: true })
    try {
      const { messages, pagination } = await getMessagesPage(conversationId, 1)
      set({ messages, messagesPagination: pagination, loading: false })
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error)
      set({ messages: [], messagesPagination: null, loading: false })
    }
  },

  // Carrega a próxima página (mais antiga) e prepend na lista. Retorna quantas
  // mensagens foram adicionadas (para preservar a posição de scroll).
  loadOlderMessages: async conversationId => {
    const { messagesPagination, loadingOlder, messages } = get()
    if (loadingOlder || !messagesPagination) return 0
    if (messagesPagination.page >= messagesPagination.pages) return 0

    set({ loadingOlder: true })
    try {
      const nextPage = messagesPagination.page + 1
      const { messages: older, pagination } = await getMessagesPage(conversationId, nextPage, messagesPagination.limit)
      const existingIds = new Set(messages.map(m => m._id))
      const deduped = older.filter(m => !existingIds.has(m._id))
      // total/pages só vêm na 1ª página; preserva-os ao avançar para não perder
      // o critério de parada da paginação.
      const mergedPagination = {
        ...pagination,
        total: pagination.total ?? messagesPagination.total,
        pages: pagination.pages ?? messagesPagination.pages,
      }
      set({ messages: [...deduped, ...messages], messagesPagination: mergedPagination, loadingOlder: false })
      return deduped.length
    } catch (error) {
      console.error("Erro ao carregar mensagens anteriores:", error)
      set({ loadingOlder: false })
      return 0
    }
  },

  sendMessage: async (socket, text) => {
    const { activeConversation } = get()
    if (!activeConversation) return
    try {
      const sharedKeyBase64 = await loadConversationKey(activeConversation._id)
      if (!sharedKeyBase64) return
      const sharedKey = await importConversationKey(sharedKeyBase64)
      const { cipherText, iv } = await encryptMessage(sharedKey, text)
      socket.emit('sendMessage', { conversationId: activeConversation._id, cipherText, iv })
    } catch (error) {
      console.error("Erro ao criptografar/enviar mensagem:", error)
    }
  },

  addMessage: message =>
    set(state => {
      const exists = state.messages.some(m => m._id === message._id)
      if (exists) return state
      return { messages: [...state.messages, message] }
    }),

  // Mensagem otimista (status 'pending') — exibida imediatamente ao enviar.
  addOptimistic: message =>
    set(state => ({ messages: [...state.messages, { ...message, status: 'pending' }] })),

  // Reconcilia o eco do servidor com a mensagem otimista (casando por clientId).
  reconcileMessage: message =>
    set(state => {
      if (message.clientId) {
        const idx = state.messages.findIndex(m => m.clientId === message.clientId)
        if (idx >= 0) {
          const next = [...state.messages]
          next[idx] = { ...next[idx], ...message, status: 'sent' }
          return { messages: next }
        }
      }
      if (state.messages.some(m => m._id === message._id)) return state
      return { messages: [...state.messages, { ...message, status: 'sent' }] }
    }),

  markMessageFailed: clientId =>
    set(state => ({
      messages: state.messages.map(m =>
        m.clientId === clientId && m.status === 'pending' ? { ...m, status: 'failed' } : m
      )
    })),

  markMessagePending: clientId =>
    set(state => ({
      messages: state.messages.map(m =>
        m.clientId === clientId ? { ...m, status: 'pending' } : m
      )
    })),

  markAsRead: messageId =>
    set(state => ({
      messages: state.messages.map(m =>
        m._id === messageId ? { ...m, read: true } : m
      )
    })),

  updateReactions: (messageId, reactions) =>
    set(state => ({
      messages: state.messages.map(m =>
        m._id === messageId ? { ...m, reactions } : m
      )
    })),

  updateLastMessage: message =>
    set(state => ({
      conversations: state.conversations.map(c =>
        c._id === message.conversationId
          ? { ...c, lastMessage: message }
          : c
      )
    }))
}))
