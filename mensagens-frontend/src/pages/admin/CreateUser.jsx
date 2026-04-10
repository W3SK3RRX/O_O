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
    setError(null)
    setSuccess(null)

    if (password.length < 6) {
      return setError('erro: senha deve ter no mínimo 6 caracteres')
    }

    if (password !== confirm) {
      return setError('erro: as senhas não coincidem')
    }

    try {
      setLoading(true)

      await createUser({
        name,
        email,
        password,
        role
      })

      setSuccess('sucesso: usuário criado')

      setName('')
      setEmail('')
      setRole('user')
      setPassword('')
      setConfirm('')
    } catch {
      setError('erro: falha ao criar usuário')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.sectionTitle}>{'>'} criar novo usuário</div>

      <form onSubmit={handleSubmit} style={styles.form}>
        {error && <p style={styles.error}>{'>'} {error}</p>}
        {success && <p style={styles.success}>{'>'} {success}</p>}

        <input
          style={styles.input}
          placeholder="nome"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />

        <input
          style={styles.input}
          type="email"
          placeholder="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        <input
          style={styles.input}
          type="password"
          placeholder="senha inicial"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        <input
          style={styles.input}
          type="password"
          placeholder="confirmar senha"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
        />

        <select
          style={styles.select}
          value={role}
          onChange={e => setRole(e.target.value)}
        >
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>

        <button style={styles.button} disabled={loading}>
          {loading ? '[CRIANDO...]' : '[CRIAR USUÁRIO]'}
        </button>
      </form>
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
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid var(--border)',
    outline: 'none',
    background: '#010805',
    color: 'var(--text-main)',
    fontSize: 14
  },
  select: {
    width: '100%',
    padding: '12px',
    border: '1px solid var(--border)',
    outline: 'none',
    background: '#010805',
    color: 'var(--text-main)',
    fontSize: 14,
    cursor: 'pointer'
  },
  button: {
    padding: '12px',
    border: '1px solid var(--accent-strong)',
    background: 'rgba(0, 255, 90, 0.12)',
    color: 'var(--accent)',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: 14
  },
  error: {
    color: 'var(--danger)',
    fontSize: 12,
    margin: 0
  },
  success: {
    color: 'var(--accent)',
    fontSize: 12,
    margin: 0
  }
}
