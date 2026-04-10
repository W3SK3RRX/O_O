import Stats from './Stats'
import OnlineUsers from './OnlineUsers'
import UserList from './UserList'
import CreateUser from './CreateUser'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
  const navigate = useNavigate()

  return (
    <div style={styles.container}>
      <div style={styles.shell}>
        <div style={styles.header}>
          <button
            style={styles.backButton}
            onClick={() => navigate(-1)}
            title="Voltar"
          >
            {'<'}
          </button>

          <div style={styles.identity}>
            <div style={styles.prompt}>[ADMIN: root]</div>
            <strong style={styles.title}>PAINEL ADMIN</strong>
          </div>
        </div>

        <div style={styles.subheader}>
          SYSTEM_ADMIN :: modo root ativo
        </div>

        <div style={styles.content}>
          <Stats />
          <OnlineUsers />
          <CreateUser />
          <UserList />
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100dvh',
    padding: '16px 10px',
    display: 'flex',
    justifyContent: 'center'
  },
  shell: {
    width: '100%',
    maxWidth: 940,
    border: '1px solid var(--border)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(180deg, rgba(2, 18, 13, 0.98), rgba(0, 9, 6, 0.98))',
    boxShadow: '0 0 18px rgba(0, 255, 90, 0.12), inset 0 0 20px rgba(0, 255, 90, 0.04)'
  },
  header: {
    padding: '12px 14px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    gap: 10
  },
  identity: {
    flex: 1
  },
  prompt: {
    color: 'var(--accent)',
    fontSize: 12,
    marginBottom: 2
  },
  title: {
    fontSize: 18,
    letterSpacing: 1
  },
  backButton: {
    background: 'transparent',
    border: '1px solid var(--border)',
    color: 'var(--accent)',
    fontSize: 18,
    width: 36,
    height: 36,
    cursor: 'pointer'
  },
  subheader: {
    padding: '10px 14px',
    fontSize: 12,
    color: 'var(--text-muted)',
    borderBottom: '1px solid rgba(14, 143, 61, 0.5)'
  },
  content: {
    padding: 14,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 20
  }
}
