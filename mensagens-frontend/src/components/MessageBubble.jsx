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
          maxWidth: 'min(88%, 72ch)',
          padding: '10px 12px',
          borderRadius: isMine
            ? '12px 12px 4px 12px'
            : '12px 12px 12px 4px',
          border: `1px solid ${isMine ? '#2e6f55' : 'var(--border)'}`,
          background: isMine
            ? 'rgba(32, 73, 56, 0.82)'
            : 'rgba(16, 25, 40, 0.82)',
          color: 'var(--text-main)',
          boxShadow: '0 8px 18px rgba(0, 0, 0, 0.25)'
        }}
      >
        <div style={{ fontSize: 14, lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>
          {message.text}
        </div>
        <div
          style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            marginTop: 6,
            textAlign: 'right'
          }}
        >
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  )
}
