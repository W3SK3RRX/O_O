import api from './api'

export async function getConversations() {
  const res = await api.get('/conversations')
  return res.data
}

export async function getMessages(conversationId) {
  const res = await api.get(`/messages/${conversationId}`)
  return res.data
}

export async function createConversation(participantId) {
  const res = await api.post('/conversations', {
    receiverId: participantId,
    participantId,
  })
  return res.data
}

export async function saveConversationKeys(conversationId, encryptedKeys) {
  const res = await api.post(
    `/conversations/${conversationId}/keys`,
    { encryptedKeys }
  )
  return res.data
}
