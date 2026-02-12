import { useState } from 'react'
import { createUser } from '../../api/admin.api'

export default function CreateUser() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('user')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleSubmit = async e => {
    e.preventDefault()

    if (password.length < 6) {
      return setError('A senha deve ter no mínimo 6 caracteres')
    }

    if (password !== confirm) {
      return setError('As senhas não coincidem')
    }

    try {
      setLoading(true)
      setError(null)

      await createUser({
        name,
        email,
        password,
        role
      })

      setSuccess('Usuário criado com sucesso')

      setName('')
      setEmail('')
      setRole('user')
      setPassword('')
      setConfirm('')
    } catch {
      setError('Erro ao criar usuário')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <strong>Criar Usuário</strong>

      {error && <p style={styles.error}>{error}</p>}
      {success && <p style={styles.success}>{success}</p>}

      <input
        style={styles.input}
        placeholder="Nome"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />

      <input
        style={styles.input}
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />

      <input
        style={styles.input}
        type="password"
        placeholder="Senha inicial"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />

      <input
        style={styles.input}
        type="password"
        placeholder="Confirmar senha"
        value={confirm}
        onChange={e => setConfirm(e.target.value)}
        required
      />

      <select
        style={styles.input}
        value={role}
        onChange={e => setRole(e.target.value)}
      >
        <option value="user">Usuário</option>
        <option value="admin">Admin</option>
      </select>

      <button style={styles.button} disabled={loading}>
        {loading ? 'Criando...' : 'Criar Usuário'}
      </button>
    </form>
  )
}

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  },
  input: {
    padding: '12px 16px',
    fontSize: 16,
    borderRadius: 20,
    border: 'none',
    outline: 'none',
    background: '#1f2437',
    color: '#fff'
  },
  button: {
    padding: '12px',
    borderRadius: 20,
    border: 'none',
    background: '#2e7d32',
    color: '#fff',
    cursor: 'pointer'
  },
  error: {
    color: '#ff5252',
    fontSize: 14
  },
  success: {
    color: '#4caf50',
    fontSize: 14
  }
}
