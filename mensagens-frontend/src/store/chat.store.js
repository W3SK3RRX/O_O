import { create } from 'zustand'
import { getConversations, getMessages } from '../api/chat.api'
import { encryptMessage } from '../crypto/message'
import { loadConversationKey } from '../crypto/conv-storage'
import { importConversationKey } from '../crypto/conversation'

export const useChatStore = create((set, get) => ({
  conversations: [],
  messages: [],
  activeConversation: null,
  loading: false,
  pagination: null,
  unreadCounts: {},

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

  fetchConversations: async () => {
    set({ loading: true })
    try {
      const data = await getConversations()
      // API já extrai o array em chat.api.js
      set({ conversations: data, loading: false })
    } catch (error) {
      console.error("Erro ao buscar conversas:", error)
      set({ conversations: [], loading: false })
    }
  },

  fetchMessages: async conversationId => {
    set({ loading: true })
    try {
      const data = await getMessages(conversationId)
      // API já extrai o array em chat.api.js
      set({ messages: data, loading: false })
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error)
      set({ messages: [], loading: false })
    }
  },

  sendMessage: async (socket, text) => {
    const { activeConversation } = get()
    
    if (!activeConversation) return

    try {
      const sharedKeyBase64 = await loadConversationKey(activeConversation._id)
      
      if (!sharedKeyBase64) {
        console.error("❌ Erro: Chave da conversa não encontrada.")
        return
      }

      const sharedKey = await importConversationKey(sharedKeyBase64)
      const { cipherText, iv } = await encryptMessage(sharedKey, text)

      socket.emit('sendMessage', {
        conversationId: activeConversation._id,
        cipherText,
        iv
      })
      
    } catch (error) {
      console.error("Erro ao criptografar/enviar mensagem:", error)
    }
  },

  addMessage: message =>
    set(state => {
      const exists = state.messages.some(m => m._id === message._id)
      if (exists) return state

      return {
        messages: [...state.messages, message]
      }
    }),

  markAsRead: messageId =>
    set(state => ({
      messages: state.messages.map(m =>
        m._id === messageId ? { ...m, read: true } : m
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
