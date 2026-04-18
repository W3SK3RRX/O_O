import api from './axios'

export async function getConversations() {
  const res = await api.get('/conversations')
  
  // Extrai conversas - pode vir como { conversations: [...] } ou diretamente [...]
  let data = res.data.conversations || res.data
  
  // Se ainda for objeto com outras propriedades, tenta encontrar o array
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    // Verifica todas as propriedades do objeto
    const arrayProp = Object.keys(data).find(k => Array.isArray(data[k]))
    data = arrayProp ? data[arrayProp] : []
  }
  
  // Garante que sempre retorne array
  data = Array.isArray(data) ? data : []
  
  console.log('getConversations response:', {
    hasData: Array.isArray(data),
    count: data?.length,
    firstConversationKeys: data?.[0]?.encryptedKeys,
    firstConversationId: data?.[0]?._id,
    firstConversationKeyVersion: data?.[0]?.keyVersion,
    rawType: typeof res.data,
    rawKeys: res.data ? Object.keys(res.data) : []
  })
  
  return data
}

export async function getMessages(conversationId, page = 1, limit = 100) {
  const safeLimit = Math.min(Math.max(Number(limit) || 1, 1), 100)
  const safePage = Math.max(Number(page) || 1, 1)
  const res = await api.get(`/messages/${conversationId}?page=${safePage}&limit=${safeLimit}`)
  
  // Extrai mensagens - pode vir como { messages: [...] } ou diretamente [...]
  let data = res.data.messages || res.data
  
  // Se ainda for objeto com outras propriedades, tenta encontrar o array
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const arrayProp = Object.keys(data).find(k => Array.isArray(data[k]))
    data = arrayProp ? data[arrayProp] : []
  }
  
  // Garante que sempre retorne array
  data = Array.isArray(data) ? data : []
  data = [...data].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  
  console.log('getMessages response:', {
    conversationId,
    page: safePage,
    limit: safeLimit,
    hasData: Array.isArray(data),
    count: data?.length,
    firstMessageHasCipher: !!data?.[0]?.cipherText,
    firstMessageId: data?.[0]?._id
  })
  
  return data
}

export async function createConversation(participantId) {
  const res = await api.post('/conversations', {
    receiverId: participantId,
    participantId,
  })
  return res.data
}

export async function createGroup(name, participants) {
  const res = await api.post('/conversations/group', {
    name,
    participants
  })
  return res.data
}

export async function addParticipant(conversationId, userId) {
  const res = await api.post(`/conversations/${conversationId}/participants`, {
    userId
  })
  return res.data
}

export async function removeParticipant(conversationId, userId) {
  const res = await api.delete(`/conversations/${conversationId}/participants`, {
    data: { userId }
  })
  return res.data
}

export async function saveConversationKeys(conversationId, encryptedKeys, keyVersion) {
  const res = await api.put(
    `/conversations/${conversationId}/keys`,
    { encryptedKeys, keyVersion }
  )
  return res.data
}
