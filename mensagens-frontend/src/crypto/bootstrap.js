import { updateKeyPair } from '../api/user.api'
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

  if (hasValidLocalKeys) {
    const shouldSyncKeyPair =
      user.publicKey !== existingPublicKey || !user.privateKeyBackup

    if (shouldSyncKeyPair) {
      await updateKeyPair(existingPublicKey, existingPrivateKey)
    }

    return
  }

  if (!hasValidLocalKeys && user.privateKeyBackup && user.publicKey) {
    await savePrivateKey(user.privateKeyBackup)
    await savePublicKey(user.publicKey)
    await saveKeyOwner(user._id)
    return
  }

  if (!hasValidLocalKeys && user.publicKey && !user.privateKeyBackup) {
    throw new Error(
      'Backup da chave privada não encontrado. Faça login no dispositivo original para sincronizar as chaves.'
    )
  }

  if (!hasValidLocalKeys) {
    const { publicKey, privateKey } = await generateKeyPair()

    publicKeyBase64 = await exportPublicKey(publicKey)
    const privateKeyBase64 = await exportPrivateKey(privateKey)

    await savePrivateKey(privateKeyBase64)
    await savePublicKey(publicKeyBase64)
    await saveKeyOwner(user._id)

    await updateKeyPair(publicKeyBase64, privateKeyBase64)
  }
}
