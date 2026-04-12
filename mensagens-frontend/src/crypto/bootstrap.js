import { updateKeyPair, updatePublicKey } from '../api/user.api'
import {
  getPrivateKey,
  getPublicKey,
  getKeyOwner,
  savePrivateKey,
  savePublicKey,
  saveKeyOwner,
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
  const existingPublicKey = await getPublicKey()
  const existingOwnerId = await getKeyOwner()
  const hasValidLocalKeys =
    existingPrivateKey &&
    existingPublicKey &&
    existingOwnerId === user._id

  let publicKeyBase64 = existingPublicKey

  if (!hasValidLocalKeys && user.privateKeyBackup && user.publicKey) {
    await savePrivateKey(user.privateKeyBackup)
    await savePublicKey(user.publicKey)
    await saveKeyOwner(user._id)
    return
  }

  if (!hasValidLocalKeys) {
    const { publicKey, privateKey } = await generateKeyPair()

    publicKeyBase64 = await exportPublicKey(publicKey)
    const privateKeyBase64 = await exportPrivateKey(privateKey)

    await savePrivateKey(privateKeyBase64)
    await savePublicKey(publicKeyBase64)
    await saveKeyOwner(user._id)

    await updateKeyPair(publicKeyBase64, privateKeyBase64)
    return
  }

  // Sincroniza no backend sempre que o usuário não tiver chave registrada
  // ou quando houve rotação/troca de chave local.
  if (publicKeyBase64 && user.publicKey !== publicKeyBase64) {
    await updatePublicKey(publicKeyBase64)
  }
}
