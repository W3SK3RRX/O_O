import { useEffect, useState, useCallback } from 'react'
import { getOnlineUsers } from '../../api/admin.api'

export default function OnlineUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getOnlineUsers()
      setUsers(data)
    } catch (error) {
      console.error('Erro ao carregar usuários online:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
    
    // Polling a cada 5 segundos
    const interval = setInterval(loadUsers, 5000)
    return () => clearInterval(interval)
  }, [loadUsers])

  const formatTime = (date) => {
    if (!date) return '--:--'
    return new Date(date).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (loading) {
    return (
      <div style={styles.loading}>
        {'>'} verificando usuários online...
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.sectionTitle}>
        {'>'} sessões ativas ({users.length})
      </div>

      {users.length === 0 ? (
        <p style={styles.empty}>{'>'} nenhum usuário online no momento</p>
      ) : (
        users.map(user => (
          <div key={user.userId} style={styles.card}>
            <div style={styles.cardContent}>
              <div style={styles.name}>root@session:~$ {user.name}</div>
              <div style={styles.meta}>
                email: {user.email} • conectado: {formatTime(user.connectedAt)}
              </div>
            </div>
            <div style={styles.status}>
              <span style={styles.onlineDot}></span>
              <span style={styles.onlineText}>ONLINE</span>
            </div>
          </div>
        ))
      )}
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
  card: {
    padding: '12px',
    border: '1px solid rgba(14, 143, 61, 0.6)',
    background: 'rgba(3, 16, 11, 0.8)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12
  },
  cardContent: {
    flex: 1
  },
  name: {
    fontWeight: 700,
    fontSize: 13,
    color: 'var(--accent)'
  },
  meta: {
    fontSize: 12,
    color: 'var(--text-muted)',
    marginTop: 4
  },
  status: {
    display: 'flex',
    alignItems: 'center',
    gap: 6
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#00ff00',
    boxShadow: '0 0 6px #00ff00'
  },
  onlineText: {
    fontSize: 10,
    color: '#00ff00',
    fontFamily: 'monospace'
  },
  loading: {
    padding: 20,
    color: 'var(--text-muted)'
  },
  empty: {
    padding: 20,
    color: 'var(--text-muted)'
  }
}
