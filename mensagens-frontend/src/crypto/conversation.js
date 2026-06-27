// src/crypto/conversation.js
import { arrayBufferToBase64, base64ToArrayBuffer } from './utils'

export async function generateConversationKey() {
  return crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  )
}

export async function exportConversationKey(key) {
  const raw = await crypto.subtle.exportKey('raw', key)
  return arrayBufferToBase64(raw)
}

export async function importConversationKey(base64) {
  const raw = base64ToArrayBuffer(base64)
  return crypto.subtle.importKey(
    'raw',
    raw,
    { name: 'AES-GCM' },
    true,
    ['encrypt', 'decrypt']
  )
}
