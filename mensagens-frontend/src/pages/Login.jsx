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
        hasPrivateKeyBackup: data.hasPrivateKeyBackup,
        role: data.role,
        isAdmin: data.isAdmin,
        vapidPublicKey: data.vapidPublicKey,
      }

      // Refresh token vem em cookie httpOnly (não trafega no corpo/JS).
      await login(user, token, password)

      navigate('/', { replace: true })
    } catch {
      setError('Credenciais inválidas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="screen screen--center screen--form">
      <form onSubmit={handleSubmit} className="shell auth-form">
        <div className="auth-form__tag">[SYSTEM_LOGIN]</div>
        <h1 className="auth-form__title">O_O</h1>
        <p className="auth-form__subtitle">root@secure:~$ login --encrypted</p>

        {error && <p className="error-text">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="field"
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="field"
        />

        <button type="submit" disabled={loading} className="btn btn--primary btn--block">
          {loading ? 'CONECTANDO...' : 'ENTRAR'}
        </button>
      </form>
    </div>
  )
}