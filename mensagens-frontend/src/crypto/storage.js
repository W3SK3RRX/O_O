const DB_NAME = 'crypto-db';
const DB_VERSION = 2;
const STORE_NAME = 'user-keys';

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
            if (!db.objectStoreNames.contains('conversation-keys')) {
                db.createObjectStore('conversation-keys');
            }
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

// Salva o objeto completo { publicKey, privateKey }
export async function saveKeys(keys) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(keys, 'my-keys');

        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e.target.error);
    });
}

export async function loadKeys() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get('my-keys');

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (e) => reject(e.target.error);
    });
}

export async function clearKeys() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e.target.error);
    });
}

// --- FUNÇÕES DE COMPATIBILIDADE (Para bootstrap.js) ---

export async function getPrivateKey() {
    const keys = await loadKeys();
    return keys ? keys.privateKey : null;
}

export async function getPublicKey() {
    const keys = await loadKeys();
    return keys ? keys.publicKey : null;
}

// FIX: Adicionada função para salvar apenas a chave privada (mantendo a pública se existir)
export async function savePrivateKey(privateKey) {
    const currentKeys = (await loadKeys()) || {};
    currentKeys.privateKey = privateKey;
    return saveKeys(currentKeys);
}

// FIX: Adicionada função para salvar apenas a chave pública (mantendo a privada se existir)
export async function savePublicKey(publicKey) {
    const currentKeys = (await loadKeys()) || {};
    currentKeys.publicKey = publicKey;
    return saveKeys(currentKeys);
}