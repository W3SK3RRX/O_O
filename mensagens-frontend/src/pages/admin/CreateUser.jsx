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
    <div className="section">
      <div className="section-title">{'>'} criar novo usuário</div>

      <form onSubmit={handleSubmit} className="section">
        {error && <p className="error-text">{'>'} {error}</p>}
        {success && <p style={{ color: 'var(--accent)', fontSize: 'var(--fs-xs)', margin: 0 }}>{'>'} {success}</p>}

        <input
          className="field"
          placeholder="nome"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />

        <input
          className="field"
          type="email"
          placeholder="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        <input
          className="field"
          type="password"
          placeholder="senha inicial"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="new-password"
          required
        />

        <input
          className="field"
          type="password"
          placeholder="confirmar senha"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          autoComplete="new-password"
          required
        />

        <select
          className="field"
          value={role}
          onChange={e => setRole(e.target.value)}
        >
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>

        <button className="btn btn--primary btn--block" disabled={loading}>
          {loading ? '[CRIANDO...]' : '[CRIAR USUÁRIO]'}
        </button>
      </form>
    </div>
  )
}
