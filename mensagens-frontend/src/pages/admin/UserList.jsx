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
      // getUsers agora retorna { users, pagination } (backend paginado).
      const data = await getUsers()
      setUsers(data.users ?? [])
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
      <div className="empty-text">{'>'} carregando usuários...</div>
    )
  }

  const smallBtn = { fontSize: 'var(--fs-xs)', minHeight: 40, padding: '0 var(--sp-2)' }

  return (
    <div className="section">
      <div className="section-title">{'>'} lista de usuários ({filteredUsers.length})</div>

      <input
        className="field"
        placeholder="buscar por nome ou email..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {filteredUsers.map(user => (
        <div key={user._id} className="card">
          {editingId === user._id ? (
            <>
              <input
                className="field"
                value={editForm.name}
                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Nome"
              />
              <select
                className="field"
                value={editForm.role}
                onChange={e => setEditForm({ ...editForm, role: e.target.value })}
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
              <div className="card__actions">
                <button className="btn btn--primary" style={smallBtn} onClick={() => saveEdit(user._id)}>
                  [SALVAR]
                </button>
                <button className="btn" style={smallBtn} onClick={cancelEdit}>
                  [CANCELAR]
                </button>
              </div>
            </>
          ) : (
            <div>
              <div style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', color: 'var(--accent)' }}>root@user:~$ {user.name}</div>
              <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginTop: 4, wordBreak: 'break-word' }}>
                email: {user.email} • role: {user.role || 'user'} • status: {user.active ? 'ATIVO' : 'INATIVO'}
              </div>
            </div>
          )}

          <div className="card__actions">
            <button className="btn" style={smallBtn} onClick={() => startEdit(user)}>
              [EDITAR]
            </button>
            <button className="btn" style={smallBtn} onClick={() => toggleStatus(user)}>
              {user.active ? '[DESATIVAR]' : '[ATIVAR]'}
            </button>
            <button className="btn" style={smallBtn} onClick={() => resetPassword(user._id)}>
              [RESET]
            </button>
            <button className="btn btn--danger" style={smallBtn} onClick={() => handleDelete(user._id)}>
              [EXCLUIR]
            </button>
          </div>
        </div>
      ))}

      {filteredUsers.length === 0 && (
        <p className="empty-text">{'>'} nenhum usuário encontrado</p>
      )}
    </div>
  )
}