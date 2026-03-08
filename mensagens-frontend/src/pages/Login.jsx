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
      const user = {
        _id: data._id,
        name: data.name,
        email: data.email,
        avatar: data.avatar,
        publicKey: data.publicKey,
        isAdmin: data.isAdmin,
        mustChangePassword: data.mustChangePassword,
      }

      await login(user, token)

      if (user.mustChangePassword) {
        navigate('/change-password', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } catch (err) {
      setError('Credenciais inválidas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.promptLine}>secure-chat@login:~$</div>
        <h2 style={styles.title}>Acesso seguro</h2>
        <p style={styles.subtitle}>Entre para iniciar uma sessão criptografada</p>

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
          {loading ? 'Conectando...' : 'Entrar'}
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
    padding: '24px 16px'
  },
  form: {
    width: 'min(92vw, 420px)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    padding: '24px 20px',
    borderRadius: 14,
    border: '1px solid var(--border)',
    background: 'linear-gradient(180deg, rgba(18, 31, 52, 0.95) 0%, rgba(9, 17, 29, 0.96) 100%)',
    boxShadow: '0 24px 50px rgba(0, 0, 0, 0.45)'
  },
  promptLine: {
    color: 'var(--accent)',
    fontSize: 12
  },
  title: {
    margin: 0,
    fontSize: 24
  },
  subtitle: {
    margin: '0 0 8px',
    fontSize: 13,
    color: 'var(--text-muted)'
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid var(--border)',
    outline: 'none',
    background: 'var(--bg-main)',
    color: 'var(--text-main)'
  },
  button: {
    marginTop: 4,
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid var(--accent-strong)',
    background: 'linear-gradient(180deg, #4dd89b 0%, #2ca171 100%)',
    color: '#06281d',
    fontWeight: 700,
    cursor: 'pointer'
  },
  error: {
    margin: 0,
    color: 'var(--danger)',
    fontSize: 13
  }
}
