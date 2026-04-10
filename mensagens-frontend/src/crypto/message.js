import { base64ToArrayBuffer, arrayBufferToBase64 } from './utils'

export async function encryptMessage(conversationKey, plainText) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(plainText)

  const cipherBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv
    },
    conversationKey,
    encoded
  )

  return {
    cipherText: arrayBufferToBase64(cipherBuffer),
    iv: arrayBufferToBase64(iv)
  }
}

export async function decryptMessage(conversationKey, cipherText, iv) {
  const cipherBuffer = base64ToArrayBuffer(cipherText)
  const ivBuffer = base64ToArrayBuffer(iv)

  console.log('decryptMessage - INPUT:', {
    cipherBufferLength: cipherBuffer.byteLength,
    ivBufferLength: ivBuffer.byteLength,
    keyAlgorithm: conversationKey.algorithm.name,
    keyLength: conversationKey.algorithm.length
  })

  // IV deve ter exatamente 12 bytes para AES-GCM
  if (ivBuffer.byteLength !== 12) {
    throw new Error(`IV length inválido: ${ivBuffer.byteLength}, esperado 12`)
  }

  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBuffer
    },
    conversationKey,
    cipherBuffer
  )

  return new TextDecoder().decode(decrypted)
}
