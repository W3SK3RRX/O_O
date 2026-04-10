import api from './api'

export async function getConversations() {
  const res = await api.get('/conversations')
  const data = res.data.conversations || res.data
  
  console.log('getConversations response:', {
    hasData: Array.isArray(data),
    count: data?.length,
    firstConversationKeys: data?.[0]?.encryptedKeys,
    firstConversationId: data?.[0]?._id,
    firstConversationKeyVersion: data?.[0]?.keyVersion
  })
  
  return data
}

export async function getMessages(conversationId) {
  const res = await api.get(`/messages/${conversationId}`)
  const data = res.data.messages || res.data
  
  console.log('getMessages response:', {
    conversationId,
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
