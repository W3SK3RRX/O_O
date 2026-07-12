import { arrayBufferToBase64, base64ToArrayBuffer } from './utils'

// Teto do arquivo em claro. O ciphertext fica um pouco maior (tag GCM + base64),
// dentro do limite de 12mb do endpoint de upload.
export const MAX_ATTACHMENT_BYTES = 6 * 1024 * 1024 // 6MB

// Cifra um File/Blob com a chave da conversa (AES-GCM). Retorna o ciphertext em
// base64 + iv + metadados para enviar junto da mensagem.
export async function encryptFile(conversationKey, file) {
  if (file.size > MAX_ATTACHMENT_BYTES) {
    throw new Error('Arquivo excede o tamanho máximo (6MB)')
  }

  const iv = crypto.getRandomValues(new Uint8Array(12))
  const buffer = await file.arrayBuffer()

  const cipherBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    conversationKey,
    buffer
  )

  // O ciphertext vai como binário (ArrayBuffer) direto no corpo do upload —
  // sem base64. O iv é pequeno e segue nos metadados da mensagem (base64).
  return {
    cipherBuffer,
    iv: arrayBufferToBase64(iv),
    name: file.name,
    mime: file.type || 'application/octet-stream',
    size: file.size,
  }
}

// Decifra o ciphertext (ArrayBuffer binário vindo do download) e devolve um
// object URL para uso em <img>/<a download>. Quem chama é responsável por
// revogar o URL (URL.revokeObjectURL) ao descartar.
export async function decryptToBlobUrl(conversationKey, cipherBuffer, iv, mime) {
  const ivBuffer = base64ToArrayBuffer(iv)

  const plainBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(ivBuffer) },
    conversationKey,
    cipherBuffer
  )

  const blob = new Blob([plainBuffer], { type: mime || 'application/octet-stream' })
  return URL.createObjectURL(blob)
}
