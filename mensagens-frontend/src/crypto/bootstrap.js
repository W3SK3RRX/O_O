import { updateKeyPair, getKeyBackup } from '../api/user.api'
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

  if (hasValidLocalKeys) {
    const shouldSyncKeyPair = user.publicKey !== existingPublicKey || !user.hasPrivateKeyBackup

    if (shouldSyncKeyPair) {
      await updateKeyPair(existingPublicKey, existingPrivateKey)
    }

    return
  }

  if (user.hasPrivateKeyBackup && user.publicKey) {
    const keyBackup = await getKeyBackup()

    if (keyBackup?.privateKeyBackup && keyBackup?.publicKey) {
      await savePrivateKey(keyBackup.privateKeyBackup)
      await savePublicKey(keyBackup.publicKey)
      await saveKeyOwner(user._id)
      return
    }
  }

  if (!hasValidLocalKeys && user.publicKey && user.hasPrivateKeyBackup) {
    throw new Error(
      'Não foi possível recuperar o backup da chave privada neste momento. Faça login novamente.'
    )
  }

  if (!hasValidLocalKeys) {
    const { publicKey, privateKey } = await generateKeyPair()

    const publicKeyBase64 = await exportPublicKey(publicKey)
    const privateKeyBase64 = await exportPrivateKey(privateKey)

    await savePrivateKey(privateKeyBase64)
    await savePublicKey(publicKeyBase64)
    await saveKeyOwner(user._id)

    await updateKeyPair(publicKeyBase64, privateKeyBase64)
  }
}
