// Faixa central que separa grupos de mensagens de dias diferentes.
export default function DaySeparator({ label }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        margin: '12px 0',
        color: 'var(--text-muted)',
        fontSize: 'var(--fs-2xs)',
      }}
    >
      <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      <span style={{ textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>
        {label}
      </span>
      <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  )
}
