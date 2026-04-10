import { useEffect, useState } from 'react'
import { getDashboardStats } from '../../api/admin.api'

export default function Stats() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    getDashboardStats().then(setStats).catch(console.error)
  }, [])

  if (!stats) {
    return (
      <div style={styles.loading}>
        {'>'} carregando estatísticas...
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.sectionTitle}>{'>'} estatísticas do sistema</div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.value}>{stats.totalUsers}</div>
          <div style={styles.label}>usuários total</div>
        </div>

        <div style={styles.card}>
          <div style={styles.value}>{stats.activeUsers}</div>
          <div style={styles.label}>usuários ativos</div>
        </div>

        <div style={styles.card}>
          <div style={styles.value}>{stats.totalConversations}</div>
          <div style={styles.label}>conversas</div>
        </div>

        <div style={styles.card}>
          <div style={styles.value}>{stats.totalMessages}</div>
          <div style={styles.label}>mensagens</div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  },
  sectionTitle: {
    fontSize: 12,
    color: 'var(--accent)'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 10
  },
  card: {
    padding: '14px',
    border: '1px solid rgba(14, 143, 61, 0.6)',
    background: 'rgba(3, 16, 11, 0.8)',
    textAlign: 'center'
  },
  value: {
    fontSize: 24,
    fontWeight: 700,
    color: 'var(--accent)',
    fontFamily: 'monospace'
  },
  label: {
    fontSize: 11,
    color: 'var(--text-muted)',
    marginTop: 4
  },
  loading: {
    padding: 20,
    color: 'var(--text-muted)'
  }
}
