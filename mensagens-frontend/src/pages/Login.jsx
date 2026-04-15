import { useState } from 'react'
import { loginRequest } from '../api/auth.api'
import { useAuthStore } from '../store/auth.store'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const login = useAuthStore(state => state.login)
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const data = await loginRequest(email, password)
      const token = data.token
      const refreshToken = data.refreshToken
      const user = {
        _id: data._id,
        name: data.name,
        email: data.email,
        avatar: data.avatar,
        publicKey: data.publicKey,
        hasPrivateKeyBackup: data.hasPrivateKeyBackup,
        role: data.role,
        isAdmin: data.isAdmin,
        mustChangePassword: data.mustChangePassword,
      }

      await login(user, token, refreshToken)

      if (user.mustChangePassword) {
        navigate('/change-password', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } catch {
      setError('Credenciais inválidas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.promptLine}>[SYSTEM_LOGIN]</div>
        <h2 style={styles.title}>O_O</h2>
        <p style={styles.subtitle}>root@secure:~$ login --encrypted</p>

        {error && <p style={styles.error}>{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={styles.input}
        />

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'CONECTANDO...' : 'ENTRAR'}
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
    padding: '16px 10px'
  },
  form: {
    width: 'min(100%, 760px)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    padding: '18px 14px',
    border: '1px solid var(--border)',
    background: 'linear-gradient(180deg, rgba(2, 18, 13, 0.98), rgba(0, 9, 6, 0.98))',
    boxShadow: '0 0 18px rgba(0, 255, 90, 0.12), inset 0 0 20px rgba(0, 255, 90, 0.04)'
  },
  promptLine: {
    color: 'var(--accent)',
    fontSize: 12
  },
  title: {
    margin: 0,
    fontSize: 24,
    letterSpacing: 1
  },
  subtitle: {
    margin: '0 0 8px',
    fontSize: 12,
    color: 'var(--text-muted)'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid var(--border)',
    outline: 'none',
    background: '#010805',
    color: 'var(--text-main)'
  },
  button: {
    marginTop: 4,
    padding: '12px',
    border: '1px solid var(--accent-strong)',
    background: 'rgba(0, 255, 90, 0.12)',
    color: 'var(--accent)',
    fontWeight: 700,
    cursor: 'pointer'
  },
  error: {
    margin: 0,
    color: 'var(--danger)',
    fontSize: 13
  }
}