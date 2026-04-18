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
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.promptLine}>[SET_PASSWORD]</div>
        <h2 style={styles.title}>Definir Senha</h2>

        {error && <small style={styles.error}>{error}</small>}

        <input
          type="password"
          placeholder="Nova senha"
          value={password}
          onChange={e => setPasswordValue(e.target.value)}
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
    width: 'min(100%, 480px)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    padding: '18px 14px',
    border: '1px solid var(--border)',
    background: 'linear-gradient(180deg, rgba(2, 18, 13, 0.98), rgba(0, 9, 6, 0.98))',
    boxShadow: '0 0 18px rgba(0, 255, 90, 0.12)',
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
    padding: '12px',
    minHeight: 44,
    border: '1px solid var(--accent-strong)',
    background: 'rgba(0, 255, 90, 0.12)',
    color: 'var(--accent)',
    fontWeight: 700,
    cursor: 'pointer',
  },
  error: {
    color: 'var(--danger)',
    fontSize: 12,
  },
}
