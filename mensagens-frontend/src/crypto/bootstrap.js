import { updateKeyPair, updatePublicKey, getKeyBackup } from '../api/user.api'
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
import {
  encryptPrivateKeyBackup,
  decryptPrivateKeyBackup,
  isEncryptedBackup,
} from './keyBackup'

/**
 * Inicializa a criptografia E2E do usuário.
 *
 * A chave privada é cifrada NO CLIENTE com uma chave derivada da senha
 * (ver keyBackup.js) antes de ser enviada ao servidor — o servidor nunca vê a
 * chave em claro. Por isso a `password` é necessária para criar/recuperar o backup.
 *
 * @param {object} user
 * @param {string} [password] senha do usuário (disponível no login/troca de senha)
 */
export async function bootstrapCrypto(user, password) {
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

  // 1) Já temos as chaves localmente: garante que o servidor tem a chave pública
  //    e um backup cifrado por senha atualizado.
  if (hasValidLocalKeys) {
    const backupMissing = !user.hasPrivateKeyBackup
    const publicChanged = user.publicKey !== existingPublicKey

    if (password && (backupMissing || publicChanged)) {
      const encryptedBackup = await encryptPrivateKeyBackup(existingPrivateKey, password)
      await updateKeyPair(existingPublicKey, encryptedBackup)
    } else if (!password && publicChanged) {
      // Sem senha não dá para cifrar o backup; ao menos sincroniza a chave pública.
      await updatePublicKey(existingPublicKey)
    }

    return
  }

  // 2) Recuperação a partir do backup do servidor (novo dispositivo).
  if (user.hasPrivateKeyBackup && user.publicKey) {
    const keyBackup = await getKeyBackup()

    if (keyBackup?.privateKeyBackup && keyBackup?.publicKey) {
      const wasEncrypted = isEncryptedBackup(keyBackup.privateKeyBackup)
      const privateKeyBase64 = await decryptPrivateKeyBackup(keyBackup.privateKeyBackup, password)

      await savePrivateKey(privateKeyBase64)
      await savePublicKey(keyBackup.publicKey)
      await saveKeyOwner(user._id)

      // Migra backups legados (texto puro) para o formato cifrado por senha.
      if (!wasEncrypted && password) {
        const encryptedBackup = await encryptPrivateKeyBackup(privateKeyBase64, password)
        await updateKeyPair(keyBackup.publicKey, encryptedBackup)
      }

      return
    }
  }

  // 3) Sem chaves locais nem backup utilizável: gera um novo par.
  const { publicKey, privateKey } = await generateKeyPair()

  const publicKeyBase64 = await exportPublicKey(publicKey)
  const privateKeyBase64 = await exportPrivateKey(privateKey)

  await savePrivateKey(privateKeyBase64)
  await savePublicKey(publicKeyBase64)
  await saveKeyOwner(user._id)

  if (password) {
    const encryptedBackup = await encryptPrivateKeyBackup(privateKeyBase64, password)
    await updateKeyPair(publicKeyBase64, encryptedBackup)
  } else {
    // Sem senha não criamos backup cifrado; publica apenas a chave pública.
    // O backup poderá ser criado no próximo login (quando a senha estiver disponível).
    await updatePublicKey(publicKeyBase64)
  }
}

/**
 * Re-cifra o backup da chave privada com uma nova senha. Deve ser chamado ao
 * trocar a senha, ANTES do logout, para que o backup no servidor continue
 * decifrável com a senha nova (inclusive em outros dispositivos).
 */
export async function reencryptKeyBackup(password) {
  if (!password) return

  const privateKey = await getPrivateKey()
  const publicKey = await getPublicKey()
  if (!privateKey || !publicKey) return

  const encryptedBackup = await encryptPrivateKeyBackup(privateKey, password)
  await updateKeyPair(publicKey, encryptedBackup)
}
