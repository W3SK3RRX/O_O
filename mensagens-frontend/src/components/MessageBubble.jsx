export default function MessageBubble({ message, isMine }) {
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
          maxWidth: 'min(90%, 76ch)',
          padding: '10px 12px',
          border: `1px solid ${isMine ? '#11ad4c' : 'rgba(14, 143, 61, 0.7)'}`,
          background: isMine
            ? 'rgba(2, 24, 12, 0.96)'
            : 'rgba(1, 16, 10, 0.9)',
          color: 'var(--text-main)'
        }}
      >
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
          {isMine ? 'user@local:~$' : 'root@sender:~$'} [{new Date(message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}]
        </div>
        <div style={{ fontSize: 18, marginBottom: 4 }}>{'>'}</div>
        <div style={{ fontSize: 16, lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>
          {message.text}
        </div>
      </div>
    </div>
  )
}