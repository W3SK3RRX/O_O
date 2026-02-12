export async function bootstrapCrypto(user) {
  if (!user || !user._id) {
    throw new Error('Usuário inválido ao inicializar criptografia')
  }

  const existingPrivateKey = await getPrivateKey(user._id)

  if (existingPrivateKey) return

  const { publicKey, privateKey } = await generateKeyPair()

  const publicKeyBase64 = await exportPublicKey(publicKey)
  const privateKeyBase64 = await exportPrivateKey(privateKey)

  await savePrivateKey(user._id, privateKeyBase64)

  // backend só recebe a chave pública
  await updatePublicKey(publicKeyBase64)
}
