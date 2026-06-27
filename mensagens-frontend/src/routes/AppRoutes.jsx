import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'

import Login from '../pages/Login'
import ChangePassword from '../pages/ChangePassword'
import ChatList from '../pages/ChatList'
import Chat from '../pages/Chat'
import AdminDashboard from '../pages/admin/AdminDashboard'
import NewChat from '../pages/NewChat'
import ProtectedRoute from './ProtectedRoute'

// Escuta mensagens do Service Worker (clique em notificação push) para navegar
// até a conversa correspondente sem recarregar a página.
function PushNavigationListener() {
  const navigate = useNavigate()

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const handler = (event) => {
      if (event.data?.type === 'NAVIGATE' && event.data.conversationId) {
        navigate(`/chat/${event.data.conversationId}`)
      }
    }

    navigator.serviceWorker.addEventListener('message', handler)
    return () => navigator.serviceWorker.removeEventListener('message', handler)
  }, [navigate])

  return null
}

// Guard de admin: assume que já está dentro de um ProtectedRoute (token válido)
function AdminRoute({ children }) {
  const user = useAuthStore(state => state.user)
  const isAdmin = user?.role === 'admin' || user?.isAdmin === true
  return isAdmin ? children : <Navigate to="/" replace />
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <PushNavigationListener />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/change-password" element={<ChangePassword />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ChatList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat/:conversationId"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />

        <Route
          path="/new-chat"
          element={
            <ProtectedRoute>
              <NewChat />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
