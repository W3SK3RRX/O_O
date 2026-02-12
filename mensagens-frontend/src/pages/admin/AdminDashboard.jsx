import UserList from './UserList'
import CreateUser from './CreateUser'

export default function AdminDashboard() {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <strong>Painel Administrativo</strong>
      </div>

      <div style={styles.content}>
        <CreateUser />
        <UserList />
      </div>
    </div>
  )
}

const styles = {
  container: {
    height: '100dvh',
    maxWidth: 480,
    margin: '0 auto',
    background: '#000',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    padding: '12px 16px',
    borderBottom: '1px solid #1f2933',
    background: '#0b0f1a'
  },
  content: {
    padding: 16,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 24
  }
}
