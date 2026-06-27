// src/crypto/fingerprint.js
// "Safety number" / fingerprint de uma chave pública, para verificação de
// identidade fora-de-banda (mitiga MITM na troca de chaves). Dois usuários
// comparam o mesmo fingerprint por um canal confiável.
import { base64ToArrayBuffer } from './utils'

export async function publicKeyFingerprint(publicKeyBase64) {
  if (!publicKeyBase64) return null

  const hash = await crypto.subtle.digest('SHA-256', base64ToArrayBuffer(publicKeyBase64))
  const hex = Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  // Primeiros 128 bits em grupos de 4 hex (suficiente para verificação humana)
  return hex.slice(0, 32).match(/.{1,4}/g).join(' ').toUpperCase()
}
