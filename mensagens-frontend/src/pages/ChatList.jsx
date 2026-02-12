import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChatStore } from '../store/chat.store'
import { useSocketStore } from '../store/socket.store'
import { useAuthStore } from '../store/auth.store'

export default function ChatList() {
  const navigate = useNavigate()
  const user = useAuthStore(state => state.user)
  const logout = useAuthStore(state => state.logout)
  const connect = useSocketStore(state => state.connect)
  const disconnect = useSocketStore(state => state.disconnect)

  const { conversations, fetchConversations, loading } =
    useChatStore()

  useEffect(() => {
    connect()
    fetchConversations()
  }, [connect, fetchConversations])

  const handleLogout = () => {
    disconnect()
    logout()
    navigate('/login')
  }

  if (loading) {
    return (
      <div style={styles.loading}>
        Carregando conversas...
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <strong style={styles.title}>Conversas</strong>

        <div style={styles.headerActions}>
          {user?.role === 'admin' && (
            <button
              style={styles.iconButton}
              onClick={() => navigate('/admin')}
              title="Painel Admin"
            >
              ⚙
            </button>
          )}

          <button
            style={styles.iconButton}
            onClick={handleLogout}
            title="Sair"
          >
            ⎋
          </button>

          <button
            style={styles.newChatButton}
            onClick={() => navigate('/new-chat')}
            title="Nova conversa"
          >
            +
          </button>
        </div>
      </div>

      {/* Subheader */}
      <div style={styles.subheader}>
        Bem-vindo, <strong>{user?.name}</strong>
      </div>

      {/* Lista */}
      <div style={styles.list}>
        {conversations.length === 0 && (
          <p style={styles.empty}>Nenhuma conversa ainda</p>
        )}

        {conversations.map(conv => (
          <div
            key={conv._id}
            style={styles.chatItem}
            onClick={() => navigate(`/chat/${conv._id}`)}
          >
            <div style={styles.chatContent}>
              <div style={styles.chatName}>
                Conversa
              </div>

              <div style={styles.lastMessage}>
                {conv.lastMessage?.text || 'Sem mensagens'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* =========================
   ESTILOS
   ========================= */

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#000',
    color: '#fff'
  },

  header: {
    padding: '12px 14px',
    borderBottom: '1px solid #1f2933',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#0b0f1a'
  },
  title: {
    fontSize: 16,
    fontWeight: 600
  },
  headerActions: {
    display: 'flex',
    gap: 8
  },
  iconButton: {
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: 16,
    cursor: 'pointer'
  },
  newChatButton: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    border: 'none',
    background: '#2e7d32',
    color: '#fff',
    fontSize: 20,
    cursor: 'pointer'
  },

  subheader: {
    padding: '8px 14px',
    fontSize: 13,
    opacity: 0.8,
    borderBottom: '1px solid #1f2933',
    background: '#0b0f1a'
  },

  list: {
    flex: 1,
    overflowY: 'auto',
    padding: 8,
    background: 'linear-gradient(#0b0f1a, #000)'
  },

  chatItem: {
    padding: '12px 10px',
    borderRadius: 8,
    cursor: 'pointer',
    marginBottom: 6,
    background: '#1f2437'
  },

  chatContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4
  },

  chatName: {
    fontSize: 14,
    fontWeight: 600
  },

  lastMessage: {
    fontSize: 13,
    opacity: 0.7,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },

  empty: {
    padding: 20,
    textAlign: 'center',
    opacity: 0.6
  },

  loading: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#000',
    color: '#fff'
  }
}
