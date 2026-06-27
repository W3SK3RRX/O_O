import { useEffect, useState } from 'react'
import { getDashboardStats } from '../../api/admin.api'

export default function Stats() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    getDashboardStats().then(setStats).catch(console.error)
  }, [])

  if (!stats) {
    return (
      <div className="empty-text">{'>'} carregando estatísticas...</div>
    )
  }

  return (
    <div className="section">
      <div className="section-title">{'>'} estatísticas do sistema</div>

      <div className="stat-grid">
        <div className="stat">
          <div className="stat__value">{stats.totalUsers}</div>
          <div className="stat__label">usuários total</div>
        </div>

        <div className="stat">
          <div className="stat__value">{stats.activeUsers}</div>
          <div className="stat__label">usuários ativos</div>
        </div>

        <div className="stat">
          <div className="stat__value">{stats.totalConversations}</div>
          <div className="stat__label">conversas</div>
        </div>

        <div className="stat">
          <div className="stat__value">{stats.totalMessages}</div>
          <div className="stat__label">mensagens</div>
        </div>
      </div>
    </div>
  )
}
