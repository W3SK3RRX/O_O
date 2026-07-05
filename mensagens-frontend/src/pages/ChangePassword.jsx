import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { changePassword } from '../api/user.api'
import { useAuthStore } from '../store/auth.store'
import { reencryptKeyBackup } from '../crypto/bootstrap'

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const logout = useAuthStore(state => state.logout)
  const setToken = useAuthStore(state => state.setToken)
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()

    if (password.length < 6)
      return setError('A senha deve ter no mínimo 6 caracteres')

    if (password !== confirm)
      return setError('As senhas não coincidem')

    try {
      setLoading(true)
      setError(null)

      // A troca revoga as sessões antigas e devolve um novo access token —
      // aplicamos ele antes de re-cifrar o backup (que usa o token válido).
      const { token } = await changePassword(currentPassword, password)
      if (token) setToken(token)

      // Re-cifra o backup da chave privada com a nova senha (antes do logout),
      // para que continue recuperável em qualquer dispositivo.
      try {
        await reencryptKeyBackup(password)
      } catch (err) {
        console.error('Falha ao re-cifrar backup da chave', err)
      }

      logout()
      navigate('/login', { replace: true })
    } catch (err) {
      setError(err?.response?.status === 401 ? 'Senha atual incorreta' : 'Erro ao alterar senha')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="screen screen--center screen--form">
      <form onSubmit={handleSubmit} className="shell auth-form">
        <div className="auth-form__tag">[CHANGE_PASSWORD]</div>
        <h1 className="auth-form__title">Trocar Senha</h1>
        <p className="auth-form__subtitle">root@secure:~$ passwd --force</p>

        {error && <p className="error-text" role="alert">{error}</p>}

        <input
          type="password"
          placeholder="Senha atual"
          value={currentPassword}
          onChange={e => setCurrentPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="field"
          aria-label="Senha atual"
        />

        <input
          type="password"
          placeholder="Nova senha"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          className="field"
          aria-label="Nova senha"
        />

        <input
          type="password"
          placeholder="Confirmar senha"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
          autoComplete="new-password"
          className="field"
          aria-label="Confirmar nova senha"
        />

        <button type="submit" disabled={loading} className="btn btn--primary btn--block">
          {loading ? 'SALVANDO...' : 'SALVAR SENHA'}
        </button>
      </form>
    </div>
  )
}
