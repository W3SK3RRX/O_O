import { memo, useState } from 'react'
import { formatDateTime } from '../utils/formatDate'
import AttachmentView from './AttachmentView'

const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏']

// Agrupa reactions [{user, emoji}] em { emoji: { count, mine } }.
function groupReactions(reactions, currentUserId) {
  const groups = {}
  for (const r of reactions ?? []) {
    const key = r.emoji
    if (!groups[key]) groups[key] = { count: 0, mine: false }
    groups[key].count += 1
    const uid = (r.user?._id ?? r.user)?.toString()
    if (uid === currentUserId?.toString()) groups[key].mine = true
  }
  return groups
}

// Conta quantos participantes (fora o autor) já leram esta mensagem, comparando
// a última leitura de cada um (reads) com o createdAt da mensagem.
function countReaders(message, others, reads) {
  if (!reads || !message.createdAt) return 0
  const sentAt = new Date(message.createdAt).getTime()
  return others.filter((p) => {
    const id = (p?._id ?? p)?.toString()
    const at = reads[id]
    return at && new Date(at).getTime() >= sentAt
  }).length
}

function MessageBubble({
  message,
  isMine,
  currentUserId,
  conversationKey,
  quotedText,
  others = [],
  reads = {},
  isGroup = false,
  onReply,
  onReact,
  onRetry,
}) {
  const [showPicker, setShowPicker] = useState(false)

  const time = message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  }) : '--:--'
  const fullDateTime = message.createdAt ? formatDateTime(message.createdAt) : ''

  const isDeleted = message.deleted || message.cipherText === '[mensagem apagada]'

  // Detectar URLs na mensagem.
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const urls = message.text ? (message.text.match(urlRegex) ?? []) : []
  const hasUrls = urls.length > 0

  const renderTextWithLinks = (text) => {
    if (!text) return null
    const parts = text.split(urlRegex)
    return parts.map((part, i) => {
      if (/^https?:\/\//.test(part)) {
        return (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
            {part}
          </a>
        )
      }
      return part
    })
  }

  let linkPreview = null
  if (hasUrls && urls[0]) {
    let domain = ''
    let path = ''
    try {
      const urlObj = new URL(urls[0])
      domain = urlObj.hostname.replace('www.', '')
      path = urlObj.pathname + urlObj.search
    } catch {
      domain = urls[0]
      path = ''
    }
    linkPreview = (
      <div style={styles.linkPreview}>
        <div style={styles.linkIcon} aria-hidden="true">🔗</div>
        <div style={styles.linkInfo}>
          <div style={styles.linkDomain}>{domain}</div>
          {path && <div style={styles.linkUrl}>{path}</div>}
        </div>
      </div>
    )
  }

  const reactionGroups = groupReactions(message.reactions, currentUserId)
  const reactionEntries = Object.entries(reactionGroups)
  const attachments = message.attachments ?? []
  const status = message.status // 'pending' | 'failed' | 'sent' | undefined

  // Recibo de leitura (apenas mensagens próprias, não pendentes/falhas).
  let receipt = null
  if (isMine && !isDeleted && status !== 'pending' && status !== 'failed') {
    const readers = countReaders(message, others, reads)
    if (isGroup) {
      receipt = <span style={{ color: readers > 0 ? 'var(--accent)' : 'var(--text-muted)', marginLeft: 6 }}>lido {readers}/{others.length}</span>
    } else if (readers > 0 || message.read) {
      receipt = <span style={{ color: 'var(--accent)', marginLeft: 6 }}>✓✓</span>
    } else {
      receipt = <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>✓</span>
    }
  }

  let statusBadge = null
  if (isMine && status === 'pending') {
    statusBadge = <span style={{ color: 'var(--text-muted)', marginLeft: 6 }} title="Enviando…">⏳</span>
  } else if (isMine && status === 'failed') {
    statusBadge = (
      <button
        onClick={() => onRetry?.(message)}
        style={{ marginLeft: 6, background: 'none', border: 'none', color: 'var(--danger, #ff5555)', cursor: 'pointer', font: 'inherit', padding: 0 }}
        title="Falha no envio — toque para reenviar"
      >
        ⚠ reenviar
      </button>
    )
  }

  return (
    <div className={`bubble ${isMine ? 'bubble--mine' : 'bubble--theirs'}`} role="listitem">
      <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginBottom: 4 }} title={fullDateTime}>
        {isMine ? 'user@local:~$' : 'root@sender:~$'} [{time}]
        {receipt}
        {statusBadge}
      </div>

      {/* Preview da mensagem citada (reply) */}
      {message.replyTo && (
        <div style={styles.replyQuote}>
          <div style={styles.replyAuthor}>
            {message.replyTo.senderName ?? message.replyTo.sender?.name ?? 'mensagem'}
          </div>
          <div style={styles.replyText}>
            {message.replyTo.deleted ? '[mensagem apagada]' : (quotedText ?? '…')}
          </div>
        </div>
      )}

      {message.text && (
        <div style={{ fontSize: 'var(--fs-base)', lineHeight: 1.45, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {isDeleted ? <i style={{ color: 'var(--text-muted)' }}>{message.text}</i> : renderTextWithLinks(message.text)}
        </div>
      )}

      {/* Anexos */}
      {!isDeleted && attachments.map((att) => (
        <AttachmentView key={att.attachmentId} attachment={att} conversationKey={conversationKey} />
      ))}

      {message.edited && !isDeleted && (
        <div style={{ fontSize: 'var(--fs-2xs)', color: 'var(--text-muted)', marginTop: 4 }}>
          [editado]
        </div>
      )}

      {linkPreview}

      {/* Reações existentes */}
      {reactionEntries.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
          {reactionEntries.map(([emoji, { count, mine }]) => (
            <button
              key={emoji}
              onClick={() => onReact?.(message._id, emoji)}
              aria-label={`Reagir com ${emoji} (${count})`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 3, padding: '1px 6px',
                fontSize: 'var(--fs-xs)', cursor: 'pointer',
                background: mine ? 'var(--accent)' : 'transparent',
                color: mine ? '#010805' : 'var(--text-main)',
                border: '1px solid var(--border)', borderRadius: 10,
              }}
            >
              <span>{emoji}</span><span>{count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Ações: responder / reagir (só para mensagens não apagadas) */}
      {!isDeleted && (
        <div style={{ display: 'flex', gap: 10, marginTop: 6, alignItems: 'center' }}>
          <button onClick={() => onReply?.(message)} style={styles.actionBtn} aria-label="Responder">↩ responder</button>
          <button onClick={() => setShowPicker(v => !v)} style={styles.actionBtn} aria-label="Reagir" aria-expanded={showPicker}>☺ reagir</button>
          {showPicker && (
            <span style={{ display: 'inline-flex', gap: 4 }}>
              {QUICK_EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => { onReact?.(message._id, e); setShowPicker(false) }}
                  aria-label={`Reagir com ${e}`}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 0 }}
                >
                  {e}
                </button>
              ))}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// memo: numa conversa longa, evita re-render de todas as bolhas a cada tecla
// digitada no composer ou a cada nova mensagem/reação.
export default memo(MessageBubble)

const styles = {
  actionBtn: {
    background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
    font: 'inherit', fontSize: 'var(--fs-2xs)', padding: 0,
  },
  replyQuote: {
    borderLeft: '2px solid var(--accent)', paddingLeft: 8, marginBottom: 6,
    opacity: 0.85, fontSize: 'var(--fs-xs)',
  },
  replyAuthor: { color: 'var(--accent)', fontWeight: 600 },
  replyText: {
    color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis',
    whiteSpace: 'nowrap', maxWidth: '100%',
  },
  linkPreview: {
    marginTop: 8, padding: '8px 10px', background: 'rgba(0, 255, 90, 0.08)',
    border: '1px solid var(--border)', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 8,
  },
  linkIcon: { fontSize: 18 },
  linkInfo: { flex: 1, minWidth: 0 },
  linkDomain: { fontSize: 12, color: 'var(--accent)', fontWeight: 600 },
  linkUrl: { fontSize: 10, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
}
