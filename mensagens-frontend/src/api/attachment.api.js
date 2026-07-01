import api from './axios'

// Envia o ciphertext do anexo. Retorna { attachmentId, name, mime, size }.
export async function uploadAttachment({ conversationId, name, mime, cipherBase64 }) {
  const res = await api.post('/attachments', { conversationId, name, mime, cipherBase64 })
  return res.data
}

// Baixa o ciphertext do anexo. Retorna { mime, name, size, cipherBase64 }.
export async function fetchAttachment(id) {
  const res = await api.get(`/attachments/${id}`)
  return res.data
}
