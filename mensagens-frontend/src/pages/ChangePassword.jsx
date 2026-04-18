import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { changePassword } from '../api/user.api'
import { useAuthStore } from '../store/auth.store'

export default function ChangePassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const logout = useAuthStore(state => state.logout)
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()

    if (password.length < 6)
      return setError('A senha deve ter no mínimo 6 caracteres')

    if (password !== confirm)
      return setError('As senhas não coincidem')

    try {
      setLoading(true)
      await changePassword(password)
      logout()
      navigate('/login', { replace: true })
    } catch {
      setError('Erro ao alterar senha')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.promptLine}>[CHANGE_PASSWORD]</div>
        <h2 style={styles.title}>Trocar Senha</h2>
        <p style={styles.subtitle}>root@secure:~$ passwd --force</p>

        {error && <p style={styles.error}>{error}</p>}

        <input
          type="password"
          placeholder="Nova senha"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Confirmar senha"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
          style={styles.input}
        />

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'SALVANDO...' : 'SALVAR SENHA'}
        </button>
      </form>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100dvh',
    display: 'grid',
    placeItems: 'center',
    padding: '16px 10px',
  },
  form: {
    width: 'min(100%, 560px)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    padding: '18px 14px',
    border: '1px solid var(--border)',
    background: 'linear-gradient(180deg, rgba(2, 18, 13, 0.98), rgba(0, 9, 6, 0.98))',
    boxShadow: '0 0 18px rgba(0, 255, 90, 0.12), inset 0 0 20px rgba(0, 255, 90, 0.04)',
  },
  promptLine: {
    color: 'var(--accent)',
    fontSize: 12,
  },
  title: {
    margin: 0,
    fontSize: 20,
    letterSpacing: 1,
  },
  subtitle: {
    margin: '0 0 8px',
    fontSize: 12,
    color: 'var(--text-muted)',
  },
  input: {
    width: '100%',
    padding: '12px',
    minHeight: 44,
    border: '1px solid var(--border)',
    outline: 'none',
    background: '#010805',
    color: 'var(--text-main)',
  },
  button: {
    marginTop: 4,
    padding: '12px',
    minHeight: 44,
    border: '1px solid var(--accent-strong)',
    background: 'rgba(0, 255, 90, 0.12)',
    color: 'var(--accent)',
    fontWeight: 700,
    cursor: 'pointer',
  },
  error: {
    margin: 0,
    color: 'var(--danger)',
    fontSize: 13,
  },
}
