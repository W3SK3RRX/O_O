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

      // 🔒 força novo login após troca
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
        <h2>Trocar Senha</h2>

        {error && <p style={styles.error}>{error}</p>}

        <input
          type="password"
          placeholder="Nova senha"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirmar senha"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar senha'}
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
    width: 320,
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  },
  error: {
    color: 'red'
  }
}
