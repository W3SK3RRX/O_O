const DB_NAME = 'crypto-db'
const STORE = 'conversations'
const VERSION = 2

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION)

    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE)
      }
    }

    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function saveConversationKey(conversationId, keyBase64) {
  const db = await openDB()
  const tx = db.transaction(STORE, 'readwrite')
  tx.objectStore(STORE).put(keyBase64, conversationId)
}

export async function loadConversationKey(conversationId) {
  const db = await openDB()
  const tx = db.transaction(STORE, 'readonly')

  return new Promise((resolve, reject) => {
    const req = tx.objectStore(STORE).get(conversationId)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}
