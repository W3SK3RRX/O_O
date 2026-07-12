// Cache em memória de object URLs de anexos já decifrados. Evita re-baixar e,
// principalmente, re-decifrar (custo de CPU) a mesma imagem toda vez que o
// AttachmentView remonta — troca de conversa, scroll, re-render. Os object URLs
// pertencem ao cache: quem consome NÃO deve revogá-los.
//
// LRU simples com teto de entradas; ao exceder, revoga o object URL mais antigo
// para não vazar memória de blobs decifrados.
const MAX_ENTRIES = 60
const cache = new Map() // attachmentId -> objectUrl

export function getCachedUrl(id) {
  const url = cache.get(id)
  if (url) {
    // Renova a posição (mais recentemente usado vai para o fim).
    cache.delete(id)
    cache.set(id, url)
  }
  return url
}

export function setCachedUrl(id, url) {
  if (cache.has(id)) {
    cache.delete(id)
  } else if (cache.size >= MAX_ENTRIES) {
    const oldestId = cache.keys().next().value
    URL.revokeObjectURL(cache.get(oldestId))
    cache.delete(oldestId)
  }
  cache.set(id, url)
}
