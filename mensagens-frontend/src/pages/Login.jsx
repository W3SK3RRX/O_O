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

      // AGUARDA login + criptografia
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
        <h2>Entrar</h2>

        {error && <p style={styles.error}>{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  form: {
    width: 300,
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  },
  error: {
    color: 'red'
  }
}
