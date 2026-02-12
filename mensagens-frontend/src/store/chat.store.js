import { create } from 'zustand'
import { getConversations, getMessages } from '../api/chat.api'
import { encryptMessage } from '../crypto/message' // Import para encriptar
import { loadConversationKey } from '../crypto/conv-storage' // Import para carregar a chave da conversa

export const useChatStore = create((set, get) => ({
  conversations: [],
  messages: [],
  activeConversation: null, // Necessário para saber para quem encriptar
  loading: false,

  // Define a conversa atual e limpa mensagens antigas da view se necessário
  setActiveConversation: (conversation) => {
    set({ activeConversation: conversation })
  },

  fetchConversations: async () => {
    set({ loading: true })
    try {
      const conversations = await getConversations()
      set({ conversations, loading: false })
    } catch (error) {
      console.error("Erro ao buscar conversas:", error)
      set({ loading: false })
    }
  },

  fetchMessages: async conversationId => {
    set({ loading: true })
    try {
      const messages = await getMessages(conversationId)
      set({ messages, loading: false })
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error)
      set({ loading: false })
    }
  },

  // --- NOVA LÓGICA DE ENVIO COM CRIPTOGRAFIA ---
  sendMessage: async (socket, text) => {
    const { activeConversation } = get()
    
    if (!activeConversation) return

    try {
      // 1. Carrega a chave simétrica salva no IndexedDB
      const sharedKey = await loadConversationKey(activeConversation._id)
      
      if (!sharedKey) {
        console.error("❌ Erro: Chave da conversa não encontrada. É necessário realizar o handshake.")
        return
      }

      // 2. Criptografa o texto
      // O backend espera: { conversationId, cipherText, iv }
      const { cipherText, iv } = await encryptMessage(sharedKey, text)

      // 3. Emite para o backend via Socket
      socket.emit('sendMessage', {
        conversationId: activeConversation._id,
        cipherText,
        iv
      })

      // Nota: Não adicionamos a mensagem no array 'messages' aqui manualmente.
      // Esperamos o evento 'newMessage' voltar do socket (ou a confirmação) 
      // para chamar addMessage e garantir que todos recebam.
      
    } catch (error) {
      console.error("Erro ao criptografar/enviar mensagem:", error)
    }
  },

  addMessage: message =>
    set(state => {
      // Evita duplicatas se a mensagem já estiver na lista (por ID)
      const exists = state.messages.some(m => m._id === message._id)
      if (exists) return state

      return {
        messages: [...state.messages, message]
      }
    }),

  updateLastMessage: message =>
    set(state => ({
      conversations: state.conversations.map(c =>
        c._id === message.conversationId
          ? { ...c, lastMessage: message }
          : c
      )
    }))
}))