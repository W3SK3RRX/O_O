import api from './axios'

// Envia o ciphertext do anexo como corpo binário (octet-stream); os metadados
// vão na query string. Retorna { attachmentId, name, mime, size }.
export async function uploadAttachment({ conversationId, name, mime, cipherBuffer }) {
  const res = await api.post('/attachments', cipherBuffer, {
    params: { conversationId, name, mime },
    headers: { 'Content-Type': 'application/octet-stream' },
  })
  return res.data
}

// Baixa o ciphertext do anexo como binário. Retorna um ArrayBuffer.
export async function fetchAttachmentBytes(id) {
  const res = await api.get(`/attachments/${id}`, { responseType: 'arraybuffer' })
  return res.data
}
