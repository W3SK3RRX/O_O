import { useEffect, useState, useCallback } from 'react'
import {
  getUsers,
  updateUser,
  deleteUser,
  toggleUserStatus,
  resetUserPassword
} from '../../api/admin.api'

export default function UserList() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', role: '' })

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getUsers()
      setUsers(data)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const toggleStatus = async user => {
    try {
      await toggleUserStatus(user._id, !user.active)
      await loadUsers()
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error)
      alert(error?.response?.data?.message || 'Erro ao alterar status do usuário')
    }
  }

  const resetPassword = async userId => {
    if (confirm('Resetar senha do usuário?')) {
      try {
        const data = await resetUserPassword(userId)
        alert(`Senha resetada com sucesso!\nNova senha: ${data?.newPassword || '(não retornada)'}`)
      } catch (error) {
        console.error('Erro ao resetar senha:', error)
        alert(error?.response?.data?.message || 'Erro ao resetar senha')
      }
    }
  }

  const handleDelete = async userId => {
    if (confirm('Excluir usuário permanentemente?')) {
      await deleteUser(userId)
      await loadUsers()
    }
  }

  const startEdit = user => {
    setEditingId(user._id)
    setEditForm({ name: user.name, role: user.role || 'user' })
  }

  const saveEdit = async userId => {
    await updateUser(userId, editForm)
    setEditingId(null)
    await loadUsers()
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({ name: '', role: '' })
  }

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div style={styles.loading}>
        {'>'} carregando usuários...
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.sectionTitle}>{'>'} lista de usuários ({filteredUsers.length})</div>

      <input
        style={styles.search}
        placeholder="buscar por nome ou email..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {filteredUsers.map(user => (
        <div key={user._id} style={styles.card}>
          {editingId === user._id ? (
            <div style={styles.editForm}>
              <input
                style={styles.editInput}
                value={editForm.name}
                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Nome"
              />
              <select
                style={styles.editSelect}
                value={editForm.role}
                onChange={e => setEditForm({ ...editForm, role: e.target.value })}
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
              <div style={styles.editActions}>
                <button style={styles.saveBtn} onClick={() => saveEdit(user._id)}>
                  [SALVAR]
                </button>
                <button style={styles.cancelBtn} onClick={cancelEdit}>
                  [CANCELAR]
                </button>
              </div>
            </div>
          ) : (
            <div style={styles.cardContent}>
              <div style={styles.name}>root@user:~$ {user.name}</div>
              <div style={styles.meta}>
                email: {user.email} • role: {user.role || 'user'} • status: {user.active ? 'ATIVO' : 'INATIVO'}
              </div>
            </div>
          )}

          <div style={styles.actions}>
            <button
              style={styles.actionButton}
              onClick={() => startEdit(user)}
            >
              [EDITAR]
            </button>
            <button
              style={styles.actionButton}
              onClick={() => toggleStatus(user)}
            >
              {user.active ? '[DESATIVAR]' : '[ATIVAR]'}
            </button>
            <button
              style={styles.actionButton}
              onClick={() => resetPassword(user._id)}
            >
              [RESET]
            </button>
            <button
              style={{...styles.actionButton, borderColor: 'var(--danger)'}}
              onClick={() => handleDelete(user._id)}
            >
              [EXCLUIR]
            </button>
          </div>
        </div>
      ))}

      {filteredUsers.length === 0 && (
        <p style={styles.empty}>{'>'} nenhum usuário encontrado</p>
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
    color: 'var(--accent)',
    marginBottom: 4
  },
  search: {
    padding: '10px 12px',
    border: '1px solid var(--border)',
    outline: 'none',
    background: '#010805',
    color: 'var(--text-main)',
    fontSize: 13,
    width: '100%'
  },
  card: {
    padding: '12px',
    border: '1px solid rgba(14, 143, 61, 0.6)',
    background: 'rgba(3, 16, 11, 0.8)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap'
  },
  cardContent: {
    flex: 1,
    minWidth: 200
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
  editForm: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    flex: 1
  },
  editInput: {
    flex: 1,
    minWidth: 120,
    padding: '8px',
    border: '1px solid var(--border)',
    background: '#010805',
    color: 'var(--text-main)',
    fontSize: 13
  },
  editSelect: {
    padding: '8px',
    border: '1px solid var(--border)',
    background: '#010805',
    color: 'var(--text-main)',
    fontSize: 13,
    cursor: 'pointer'
  },
  editActions: {
    display: 'flex',
    gap: 8,
    width: '100%'
  },
  saveBtn: {
    flex: 1,
    padding: '8px',
    border: '1px solid var(--accent-strong)',
    background: 'rgba(0, 255, 90, 0.12)',
    color: 'var(--accent)',
    cursor: 'pointer',
    fontSize: 11,
    fontFamily: 'monospace'
  },
  cancelBtn: {
    flex: 1,
    padding: '8px',
    border: '1px solid var(--border)',
    background: 'transparent',
    color: 'var(--text-main)',
    cursor: 'pointer',
    fontSize: 11,
    fontFamily: 'monospace'
  },
  actions: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap'
  },
  actionButton: {
    border: '1px solid var(--border)',
    borderRadius: 0,
    padding: '6px 8px',
    cursor: 'pointer',
    background: 'transparent',
    color: 'var(--text-main)',
    fontSize: 10,
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