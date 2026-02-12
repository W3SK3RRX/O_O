// src/crypto/envelope.js

export async function encryptWithPublicKey(publicKey, dataBase64) {
  const data = Uint8Array.from(atob(dataBase64), c => c.charCodeAt(0))

  const encrypted = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    data
  )

  return btoa(String.fromCharCode(...new Uint8Array(encrypted)))
}

export async function decryptWithPrivateKey(privateKey, encryptedBase64) {
  const encrypted = Uint8Array.from(
    atob(encryptedBase64),
    c => c.charCodeAt(0)
  )

  const decrypted = await crypto.subtle.decrypt(
    { name: 'RSA-OAEP' },
    privateKey,
    encrypted
  )

  return btoa(String.fromCharCode(...new Uint8Array(decrypted)))
}
