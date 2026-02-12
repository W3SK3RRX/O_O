import { useEffect, useState } from 'react'
import {
  getUsers,
  toggleUserStatus,
  resetUserPassword
} from '../../api/admin.api'

export default function UserList() {
  const [users, setUsers] = useState([])

  const loadUsers = async () => {
    const data = await getUsers()
    setUsers(data)
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const toggleStatus = async user => {
    await toggleUserStatus(user._id, !user.active)
    loadUsers()
  }

  const resetPassword = async userId => {
    if (confirm('Resetar senha do usuário?')) {
      await resetUserPassword(userId)
    }
  }

  return (
    <div style={styles.container}>
      <strong>Usuários</strong>

      {users.map(user => (
        <div key={user._id} style={styles.card}>
          <div>
            <div style={styles.name}>{user.name}</div>
            <div style={styles.meta}>{user.email}</div>
            <div style={styles.meta}>
              {user.role} • {user.active ? 'Ativo' : 'Inativo'}
            </div>
          </div>

          <div style={styles.actions}>
            <button
              style={styles.actionButton}
              onClick={() => toggleStatus(user)}
            >
              {user.active ? 'Desativar' : 'Ativar'}
            </button>

            <button
              style={styles.actionButton}
              onClick={() => resetPassword(user._id)}
            >
              Resetar
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },
  card: {
    background: '#1f2437',
    padding: 12,
    borderRadius: 8,
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12
  },
  name: {
    fontWeight: 600
  },
  meta: {
    fontSize: 12,
    opacity: 0.7
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6
  },
  actionButton: {
    border: 'none',
    borderRadius: 6,
    padding: '6px 10px',
    cursor: 'pointer'
  }
}
