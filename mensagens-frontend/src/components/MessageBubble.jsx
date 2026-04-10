export default function MessageBubble({ message, isMine }) {
  const time = message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  }) : '--:--'

  const isDeleted = message.deleted || message.cipherText === '[mensagem apagada]'

  // Detectar URLs na mensagem
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const hasUrls = message.text && urlRegex.test(message.text)
  const urls = hasUrls ? message.text.match(urlRegex) : []

  const renderTextWithLinks = (text) => {
    if (!text) return null
    
    const parts = text.split(urlRegex)
    
    return parts.map((part, i) => {
      if (urlRegex.test(part)) {
        return (
          <a 
            key={i} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: 'var(--accent)', textDecoration: 'underline' }}
          >
            {part}
          </a>
        )
      }
      return part
    })
  }

  // Preview do primeiro link
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
        <div style={styles.linkIcon}>🔗</div>
        <div style={styles.linkInfo}>
          <div style={styles.linkDomain}>{domain}</div>
          {path && <div style={styles.linkUrl}>{path}</div>}
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isMine ? 'flex-end' : 'flex-start',
        marginBottom: 8
      }}
    >
      <div
        style={{
          maxWidth: '80%',
          padding: '10px 12px',
          border: isMine ? '1px solid #11ad4c' : '1px solid rgba(14, 143, 61, 0.7)',
          background: isMine ? 'rgba(2, 24, 12, 0.96)' : 'rgba(1, 16, 10, 0.9)',
          color: 'var(--text-main)'
        }}
      >
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
          {isMine ? 'user@local:~$' : 'root@sender:~$'} [{time}]
          {message.read && <span style={{ color: 'var(--accent)', marginLeft: 6 }}>✓✓</span>}
        </div>
        <div style={{ fontSize: 18, marginBottom: 4 }}>{'>'}</div>
        <div style={{ fontSize: 16, lineHeight: 1.45, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {isDeleted ? <i style={{ color: 'var(--text-muted)' }}>{message.text}</i> : renderTextWithLinks(message.text)}
        </div>
        
        {message.edited && !isDeleted && (
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
            [editado]
          </div>
        )}

        {linkPreview}
      </div>
    </div>
  )
}

const styles = {
  linkPreview: {
    marginTop: 8,
    padding: '8px 10px',
    background: 'rgba(0, 255, 90, 0.08)',
    border: '1px solid var(--border)',
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    gap: 8
  },
  linkIcon: {
    fontSize: 18
  },
  linkInfo: {
    flex: 1,
    minWidth: 0
  },
  linkDomain: {
    fontSize: 12,
    color: 'var(--accent)',
    fontWeight: 600
  },
  linkUrl: {
    fontSize: 10,
    color: 'var(--text-muted)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  }
}
