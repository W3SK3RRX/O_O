// src/crypto/envelope.js
import { arrayBufferToBase64, base64ToArrayBuffer } from './utils'

export async function encryptWithPublicKey(publicKey, dataBase64) {
  const data = base64ToArrayBuffer(dataBase64)

  const encrypted = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    data
  )

  return arrayBufferToBase64(encrypted)
}

export async function decryptWithPrivateKey(privateKey, encryptedBase64) {
  const encrypted = base64ToArrayBuffer(encryptedBase64)

  const decrypted = await crypto.subtle.decrypt(
    { name: 'RSA-OAEP' },
    privateKey,
    encrypted
  )

  return arrayBufferToBase64(decrypted)
}
