import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'

export default function ProtectedRoute({ children }) {
  const token = useAuthStore(state => state.token)
  const user = useAuthStore(state => state.user)

  if (!token) return <Navigate to="/login" replace />

  if (user?.mustChangePassword)
    return <Navigate to="/change-password" replace />

  return children
}
