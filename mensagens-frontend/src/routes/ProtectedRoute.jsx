import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'

export default function ProtectedRoute({ children }) {
  const token = useAuthStore(state => state.token)
  const user = useAuthStore(state => state.user)
  const hydrating = useAuthStore(state => state.hydrating)

  // Durante o boot, o access token está sendo restaurado via cookie httpOnly.
  // Se há usuário persistido, aguarda a restauração antes de decidir.
  if (hydrating && user) {
    return (
      <div className="screen screen--center" role="status" aria-live="polite">
        <p>Restaurando sessão…</p>
      </div>
    )
  }

  if (!user && !token) return <Navigate to="/login" replace />

  return children
}
