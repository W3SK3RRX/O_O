import { updatePublicKey } from '../api/user.api'
import {
  getPrivateKey,
  savePrivateKey,
  savePublicKey,
} from './storage'
import {
  generateKeyPair,
  exportPublicKey,
  exportPrivateKey,
} from './keys'

export async function bootstrapCrypto(user) {
  if (!user || !user._id) {
    throw new Error('Usuário inválido ao inicializar criptografia')
  }

  const existingPrivateKey = await getPrivateKey()

  if (existingPrivateKey) return

  const { publicKey, privateKey } = await generateKeyPair()

  const publicKeyBase64 = await exportPublicKey(publicKey)
  const privateKeyBase64 = await exportPrivateKey(privateKey)

  await savePrivateKey(privateKeyBase64)
  await savePublicKey(publicKeyBase64)

  // backend só recebe a chave pública
  await updatePublicKey(publicKeyBase64)
}
