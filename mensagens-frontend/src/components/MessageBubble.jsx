export default function MessageBubble({ message, isMine }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isMine ? 'flex-end' : 'flex-start',
        marginBottom: 10
      }}
    >
      <div
        style={{
          maxWidth: 'min(85%, 65ch)',
          padding: '10px 12px',
          borderRadius: isMine
            ? '12px 12px 4px 12px'
            : '12px 12px 12px 4px',
          background: isMine ? '#2e7d32' : '#1f2437',
          color: '#fff'
        }}
      >
        <div style={{ fontSize: 14, lineHeight: 1.4 }}>
          {message.text}
        </div>
        <div
          style={{
            fontSize: 10,
            opacity: 0.6,
            marginTop: 4,
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
