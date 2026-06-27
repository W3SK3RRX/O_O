// src/crypto/keys.js
import { arrayBufferToBase64, base64ToArrayBuffer } from './utils'

const ALGORITHM = {
  name: 'RSA-OAEP',
  modulusLength: 4096,
  publicExponent: new Uint8Array([1, 0, 1]),
  hash: 'SHA-256'
}

export async function generateKeyPair() {
  return crypto.subtle.generateKey(
    ALGORITHM,
    true,
    ['encrypt', 'decrypt']
  )
}

export async function exportPublicKey(publicKey) {
  const spki = await crypto.subtle.exportKey('spki', publicKey)
  return arrayBufferToBase64(spki)
}

export async function exportPrivateKey(privateKey) {
  const pkcs8 = await crypto.subtle.exportKey('pkcs8', privateKey)
  return arrayBufferToBase64(pkcs8)
}

export async function importPublicKey(base64) {
  const binary = base64ToArrayBuffer(base64)
  return crypto.subtle.importKey(
    'spki',
    binary,
    ALGORITHM,
    true,
    ['encrypt']
  )
}

export async function importPrivateKey(base64) {
  const binary = base64ToArrayBuffer(base64)
  return crypto.subtle.importKey(
    'pkcs8',
    binary,
    ALGORITHM,
    true,
    ['decrypt']
  )
}
