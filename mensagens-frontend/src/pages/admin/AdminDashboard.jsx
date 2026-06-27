import Stats from './Stats'
import OnlineUsers from './OnlineUsers'
import UserList from './UserList'
import CreateUser from './CreateUser'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
  const navigate = useNavigate()

  return (
    <div className="screen">
      <div className="shell shell--app">
        <header className="app-header">
          <button className="icon-btn" onClick={() => navigate(-1)} title="Voltar">
            {'<'}
          </button>

          <div className="app-header__identity">
            <div className="app-header__prompt">[ADMIN: root]</div>
            <strong className="app-header__title">PAINEL ADMIN</strong>
          </div>
        </header>

        <div className="subheader">
          SYSTEM_ADMIN :: modo root ativo
        </div>

        <div className="scroll-area" style={{ padding: 'var(--sp-3)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
          <Stats />
          <OnlineUsers />
          <CreateUser />
          <UserList />
        </div>
      </div>
    </div>
  )
}
