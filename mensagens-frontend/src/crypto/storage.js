const DB_NAME = 'crypto-db'
const STORE_NAME = 'user-keys'
const CONVERSATION_STORE = 'conversation-keys'

function openDB() {
  return new Promise((resolve, reject) => {
    // Primeiro abre sem versão para obter a versão atual
    const tempReq = indexedDB.open(DB_NAME)
    
    tempReq.onsuccess = (event) => {
      const currentVersion = event.target.result.version
      event.target.result.close()
      
      // Agora abre com a versão atual ou maior
      const request = indexedDB.open(DB_NAME, Math.max(currentVersion, 5))
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME)
        }
        if (!db.objectStoreNames.contains(CONVERSATION_STORE)) {
          db.createObjectStore(CONVERSATION_STORE)
        }
      }

      request.onsuccess = (event) => resolve(event.target.result)
      request.onerror = (event) => reject(event.target.error)
    }
    
    tempReq.onerror = () => {
      // Se não existir, cria com versão 5
      const request = indexedDB.open(DB_NAME, 5)
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME)
        }
        if (!db.objectStoreNames.contains(CONVERSATION_STORE)) {
          db.createObjectStore(CONVERSATION_STORE)
        }
      }

      request.onsuccess = (event) => resolve(event.target.result)
      request.onerror = (event) => reject(event.target.error)
    }
  })
}

// Salva o objeto completo { publicKey, privateKey }
export async function saveKeys(keys) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.put(keys, 'my-keys')

    request.onsuccess = () => resolve()
    request.onerror = (e) => reject(e.target.error)
  })
}

export async function loadKeys() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.get('my-keys')

    request.onsuccess = (event) => resolve(event.target.result)
    request.onerror = (e) => reject(e.target.error)
  })
}

export async function clearKeys() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.clear()

    request.onsuccess = () => resolve()
    request.onerror = (e) => reject(e.target.error)
  })
}

// --- FUNÇÕES DE COMPATIBILIDADE (Para bootstrap.js) ---

export async function getPrivateKey() {
  const keys = await loadKeys()
  return keys ? keys.privateKey : null
}

export async function getPublicKey() {
  const keys = await loadKeys()
  return keys ? keys.publicKey : null
}

export async function getKeyOwner() {
  const keys = await loadKeys()
  return keys ? keys.userId || null : null
}

// FIX: Adicionada função para salvar apenas a chave privada (mantendo a pública se existir)
export async function savePrivateKey(privateKey) {
  const currentKeys = (await loadKeys()) || {}
  currentKeys.privateKey = privateKey
  return saveKeys(currentKeys)
}

// FIX: Adicionada função para salvar apenas a chave pública (mantendo a privada se existir)
export async function savePublicKey(publicKey) {
  const currentKeys = (await loadKeys()) || {}
  currentKeys.publicKey = publicKey
  return saveKeys(currentKeys)
}

export async function saveKeyOwner(userId) {
  const currentKeys = (await loadKeys()) || {}
  currentKeys.userId = userId
  return saveKeys(currentKeys)
}