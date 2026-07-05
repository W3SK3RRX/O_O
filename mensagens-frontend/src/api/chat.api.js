import api from './axios'

const isDev = import.meta.env.DEV

export async function getConversations() {
  const res = await api.get('/conversations')

  // Extrai conversas - pode vir como { conversations: [...] } ou diretamente [...]
  let data = res.data.conversations || res.data

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const arrayProp = Object.keys(data).find(k => Array.isArray(data[k]))
    data = arrayProp ? data[arrayProp] : []
  }

  data = Array.isArray(data) ? data : []
  return data
}

// Busca UMA conversa pelo id (com participantes/encryptedKeys/keyVersion).
// Evita baixar a lista inteira só para abrir um chat — e funciona com >20 conversas.
export async function getConversation(conversationId) {
  const res = await api.get(`/conversations/${conversationId}`)
  return res.data
}

export async function getMessages(conversationId, page = 1, limit = 100) {
  const safeLimit = Math.min(Math.max(Number(limit) || 1, 1), 100)
  const safePage = Math.max(Number(page) || 1, 1)
  const res = await api.get(`/messages/${conversationId}?page=${safePage}&limit=${safeLimit}`)

  let data = res.data.messages || res.data
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const arrayProp = Object.keys(data).find(k => Array.isArray(data[k]))
    data = arrayProp ? data[arrayProp] : []
  }

  data = Array.isArray(data) ? data : []
  data = [...data].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  return data
}

// Página de mensagens com metadados de paginação (para "carregar anteriores").
// page 1 = mais recentes; páginas maiores = mais antigas.
export async function getMessagesPage(conversationId, page = 1, limit = 30) {
  const safeLimit = Math.min(Math.max(Number(limit) || 1, 1), 100)
  const safePage = Math.max(Number(page) || 1, 1)
  const res = await api.get(`/messages/${conversationId}?page=${safePage}&limit=${safeLimit}`)

  let messages = res.data.messages ?? res.data ?? []
  if (!Array.isArray(messages)) messages = []
  messages = [...messages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

  const pagination = res.data.pagination ?? {
    page: safePage,
    limit: safeLimit,
    total: messages.length,
    pages: 1,
  }

  if (isDev) console.debug('getMessagesPage', { conversationId, page: safePage, count: messages.length })

  return { messages, pagination }
}

export async function createConversation(participantId) {
  const res = await api.post('/conversations', {
    receiverId: participantId,
    participantId,
  })
  return res.data
}

export async function createGroup(name, participants) {
  const res = await api.post('/conversations/group', { name, participants })
  return res.data
}

export async function addParticipant(conversationId, userId) {
  const res = await api.post(`/conversations/${conversationId}/participants`, { userId })
  return res.data
}

export async function removeParticipant(conversationId, userId) {
  const res = await api.delete(`/conversations/${conversationId}/participants`, {
    data: { userId },
  })
  return res.data
}

export async function markConversationRead(conversationId) {
  const res = await api.patch(`/conversations/${conversationId}/read`)
  return res.data
}

export async function saveConversationKeys(conversationId, encryptedKeys, keyVersion) {
  const res = await api.put(`/conversations/${conversationId}/keys`, { encryptedKeys, keyVersion })
  return res.data
}
