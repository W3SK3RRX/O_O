// Cache local do texto (decifrado) da última mensagem de cada conversa, para o
// preview na lista. Como o servidor não pode decifrar (E2E), guardamos aqui o
// texto em claro apenas no dispositivo, num IndexedDB separado do de chaves.
const DB_NAME = 'chat-cache-db'
const STORE = 'last-preview'
const DB_VERSION = 1

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

export async function savePreview(conversationId, text) {
  if (!conversationId) return
  const db = await openDB()
  const tx = db.transaction(STORE, 'readwrite')
  tx.objectStore(STORE).put({ text: text ?? '', at: Date.now() }, conversationId)
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// Retorna { [conversationId]: text } com todos os previews salvos.
export async function loadAllPreviews() {
  const db = await openDB()
  const tx = db.transaction(STORE, 'readonly')
  const store = tx.objectStore(STORE)

  return new Promise((resolve, reject) => {
    const out = {}
    const req = store.openCursor()
    req.onsuccess = () => {
      const cursor = req.result
      if (cursor) {
        out[cursor.key] = cursor.value?.text ?? ''
        cursor.continue()
      } else {
        resolve(out)
      }
    }
    req.onerror = () => reject(req.error)
  })
}
