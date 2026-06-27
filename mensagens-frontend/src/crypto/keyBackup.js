// src/crypto/keyBackup.js
// Cifra a chave privada do usuário no CLIENTE, com uma chave derivada da senha
// (PBKDF2 + AES-GCM), antes de qualquer backup no servidor. Assim o servidor
// nunca tem acesso à chave privada em claro (E2E real).
import { arrayBufferToBase64, base64ToArrayBuffer } from './utils'

const VERSION = 'kb1'
// OWASP recomenda >= 210k iterações para PBKDF2-HMAC-SHA256 (2023)
const PBKDF2_ITERATIONS = 210000

async function deriveAesKey(password, salt) {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  )

  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

/** Identifica se um backup já está no formato cifrado por senha. */
export function isEncryptedBackup(value) {
  return typeof value === 'string' && value.startsWith(`${VERSION}:`)
}

/**
 * Cifra a chave privada (base64 pkcs8) com a senha do usuário.
 * Formato do envelope: "kb1:<saltB64>:<ivB64>:<cipherB64>"
 */
export async function encryptPrivateKeyBackup(privateKeyBase64, password) {
  if (!password) throw new Error('Senha necessária para cifrar o backup da chave')

  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveAesKey(password, salt)

  const cipher = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(privateKeyBase64)
  )

  return [
    VERSION,
    arrayBufferToBase64(salt),
    arrayBufferToBase64(iv),
    arrayBufferToBase64(cipher),
  ].join(':')
}

/**
 * Decifra o backup. Backups legados (texto puro, sem envelope) são retornados
 * como estão para permitir migração transparente.
 */
export async function decryptPrivateKeyBackup(envelope, password) {
  if (!isEncryptedBackup(envelope)) {
    return envelope // backup legado (não cifrado no cliente)
  }

  if (!password) throw new Error('Senha necessária para decifrar o backup da chave')

  const [, saltB64, ivB64, cipherB64] = envelope.split(':')
  const salt = new Uint8Array(base64ToArrayBuffer(saltB64))
  const iv = new Uint8Array(base64ToArrayBuffer(ivB64))
  const key = await deriveAesKey(password, salt)

  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    base64ToArrayBuffer(cipherB64)
  )

  return new TextDecoder().decode(plain)
}
