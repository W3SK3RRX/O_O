import { useState } from 'react'
import { setPassword } from '../api/user.api'

export default function SetPassword({ onSuccess }) {
  const [password, setPasswordValue] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async e => {
    e.preventDefault()

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres')
      return
    }

    if (password !== confirm) {
      setError('As senhas não coincidem')
      return
    }

    try {
      setLoading(true)
      await setPassword({ password })
      onSuccess?.()
    } catch {
      setError('Erro ao definir senha')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="screen screen--center screen--form">
      <form onSubmit={handleSubmit} className="shell auth-form">
        <div className="auth-form__tag">[SET_PASSWORD]</div>
        <h2 className="auth-form__title">Definir Senha</h2>

        {error && <small className="error-text">{error}</small>}

        <input
          type="password"
          placeholder="Nova senha"
          value={password}
          onChange={e => setPasswordValue(e.target.value)}
          required
          autoComplete="new-password"
          className="field"
        />

        <input
          type="password"
          placeholder="Confirmar senha"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
          autoComplete="new-password"
          className="field"
        />

        <button type="submit" disabled={loading} className="btn btn--primary btn--block">
          {loading ? 'SALVANDO...' : 'SALVAR SENHA'}
        </button>
      </form>
    </div>
  )
}
