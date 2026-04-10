const DB_NAME = 'crypto-db'
const STORE = 'conversation-keys'
const DB_VERSION = 6

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE)
      }
    }

    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

/**
 * Salva a chave da conversa com versionamento
 * @param {string} conversationId - ID da conversa
 * @param {string} keyBase64 - Chave em base64
 * @param {number} keyVersion - Versão da chave (timestamp ou ID)
 */
export async function saveConversationKey(conversationId, keyBase64, keyVersion) {
  const db = await openDB()
  const tx = db.transaction(STORE, 'readwrite')
  const store = tx.objectStore(STORE)

  const data = {
    key: keyBase64,
    version: keyVersion,
    createdAt: Date.now()
  }

  console.log('saveConversationKey:', { conversationId, keyLength: keyBase64?.length, version: keyVersion })

  return new Promise((resolve, reject) => {
    const req = store.put(data, conversationId)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

/**
 * Carrega a chave da conversa
 * @returns {{key: string, version: number, createdAt: number}|null}
 */
export async function loadConversationKey(conversationId) {
  const db = await openDB()
  const tx = db.transaction(STORE, 'readonly')
  const store = tx.objectStore(STORE)

  return new Promise((resolve, reject) => {
    const req = store.get(conversationId)
    req.onsuccess = () => {
      const result = req.result
      console.log('loadConversationKey:', { 
        conversationId, 
        found: !!result,
        version: result?.version 
      })
      resolve(result || null)
    }
    req.onerror = () => reject(req.error)
  })
}

/**
 * Valida se a chave local corresponde à versão do servidor
 * @returns {boolean} - true se as versões coincidirem
 */
export async function validateConversationKey(conversationId, serverVersion) {
  const local = await loadConversationKey(conversationId)
  
  if (!local) return false
  if (!serverVersion) return false
  
  return local.version === serverVersion
}

export async function deleteConversationKey(conversationId) {
  const db = await openDB()
  const tx = db.transaction(STORE, 'readwrite')
  const store = tx.objectStore(STORE)

  return new Promise((resolve, reject) => {
    const req = store.delete(conversationId)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}
