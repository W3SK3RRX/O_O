import { useEffect, useState } from 'react'
import { fetchAttachmentBytes } from '../api/attachment.api'
import { decryptToBlobUrl } from '../crypto/attachment'
import { getCachedUrl, setCachedUrl } from '../utils/attachmentCache'

function formatSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Baixa o ciphertext do anexo, decifra com a chave da conversa e renderiza
// imagem inline ou link de download. Revoga o object URL ao desmontar.
export default function AttachmentView({ attachment, conversationKey }) {
  // Se já deciframos este anexo antes, reaproveitamos o object URL do cache já
  // no primeiro render (sem rede, sem re-decifrar, sem flash de "carregando").
  const [url, setUrl] = useState(() => getCachedUrl(attachment?.attachmentId) ?? null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    const id = attachment?.attachmentId
    // Sem chave, sem id, ou já resolvido pelo cache: nada a buscar.
    if (!conversationKey || !id || getCachedUrl(id)) return

    ;(async () => {
      try {
        const cipherBuffer = await fetchAttachmentBytes(id)
        const objectUrl = await decryptToBlobUrl(
          conversationKey,
          cipherBuffer,
          attachment.iv,
          attachment.mime
        )
        if (cancelled) {
          URL.revokeObjectURL(objectUrl)
          return
        }
        // O cache passa a ser dono do URL — não revogamos ao desmontar.
        setCachedUrl(id, objectUrl)
        setUrl(objectUrl)
      } catch {
        if (!cancelled) setError(true)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [attachment?.attachmentId, attachment?.iv, attachment?.mime, conversationKey])

  const name = attachment?.name || 'anexo'
  const mime = attachment?.mime || ''
  // SVG pode conter script; nunca renderiza inline — trata como download.
  const isImage = mime.startsWith('image/') && mime !== 'image/svg+xml'

  if (error) {
    return <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginTop: 6 }}>[anexo indisponível]</div>
  }

  if (!url) {
    return <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginTop: 6 }}>carregando anexo…</div>
  }

  if (isImage) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginTop: 6 }}>
        <img
          src={url}
          alt={name}
          loading="lazy"
          decoding="async"
          style={{ maxWidth: '100%', maxHeight: 320, borderRadius: 4, border: '1px solid var(--border)' }}
        />
      </a>
    )
  }

  return (
    <a
      href={url}
      download={name}
      style={{
        display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, padding: '8px 10px',
        background: 'rgba(0, 255, 90, 0.08)', border: '1px solid var(--border)', borderRadius: 4,
        color: 'var(--accent)', textDecoration: 'none',
      }}
    >
      <span style={{ fontSize: 18 }} aria-hidden="true">📎</span>
      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {name}
      </span>
      <span style={{ fontSize: 'var(--fs-2xs)', color: 'var(--text-muted)' }}>{formatSize(attachment?.size)}</span>
    </a>
  )
}
