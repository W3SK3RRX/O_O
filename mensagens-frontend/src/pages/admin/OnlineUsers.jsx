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
      <div className="empty-text">{'>'} verificando usuários online...</div>
    )
  }

  return (
    <div className="section">
      <div className="section-title">
        {'>'} sessões ativas ({users.length})
      </div>

      {users.length === 0 ? (
        <p className="empty-text">{'>'} nenhum usuário online no momento</p>
      ) : (
        users.map(user => (
          <div key={user.userId} className="card" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', color: 'var(--accent)' }}>root@session:~$ {user.name}</div>
              <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginTop: 4, wordBreak: 'break-word' }}>
                email: {user.email} • conectado: {formatTime(user.connectedAt)}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00ff00', boxShadow: '0 0 6px #00ff00' }}></span>
              <span style={{ fontSize: 'var(--fs-2xs)', color: '#00ff00' }}>ONLINE</span>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
