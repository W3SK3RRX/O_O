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
      <div style={styles.shell}>
        <div style={styles.header}>
          <div>
            <div style={styles.prompt}>inbox@secure-chat:~$</div>
            <strong style={styles.title}>Conversas</strong>
          </div>

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

        <div style={styles.subheader}>
          Sessão ativa: <strong>{user?.name}</strong>
        </div>

        <div style={styles.list}>
          {conversations.length === 0 && (
            <p style={styles.empty}>Nenhuma conversa encontrada</p>
          )}

          {conversations.map(conv => (
            <div
              key={conv._id}
              style={styles.chatItem}
              onClick={() => navigate(`/chat/${conv._id}`)}
            >
              <div style={styles.chatContent}>
                <div style={styles.chatName}>
                  {'>_'} Conversa #{conv._id.slice(-4)}
                </div>

                <div style={styles.lastMessage}>
                  {conv.lastMessage?.text || '[sem mensagens]'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100dvh',
    padding: '18px 10px',
    display: 'flex',
    justifyContent: 'center'
  },
  shell: {
    width: 'min(100%, 920px)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(180deg, rgba(17, 28, 45, 0.96), rgba(8, 13, 22, 0.97))',
    boxShadow: '0 30px 60px rgba(0, 0, 0, 0.45)'
  },
  header: {
    padding: '14px 16px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    flexWrap: 'wrap'
  },
  prompt: {
    color: 'var(--accent)',
    fontSize: 12,
    marginBottom: 2
  },
  title: {
    fontSize: 18
  },
  headerActions: {
    display: 'flex',
    gap: 8
  },
  iconButton: {
    background: 'var(--bg-main)',
    border: '1px solid var(--border)',
    color: 'var(--text-main)',
    fontSize: 15,
    width: 34,
    height: 34,
    borderRadius: 8,
    cursor: 'pointer'
  },
  newChatButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    border: '1px solid var(--accent-strong)',
    background: 'linear-gradient(180deg, #4dd89b 0%, #2ca171 100%)',
    color: '#06281d',
    fontSize: 21,
    cursor: 'pointer'
  },
  subheader: {
    padding: '9px 16px',
    fontSize: 13,
    color: 'var(--text-muted)',
    borderBottom: '1px solid var(--border)'
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    padding: 10,
    display: 'grid',
    gap: 8
  },
  chatItem: {
    padding: '12px 12px',
    borderRadius: 10,
    cursor: 'pointer',
    border: '1px solid var(--border)',
    background: 'rgba(16, 25, 40, 0.7)'
  },
  chatContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5
  },
  chatName: {
    fontSize: 13,
    fontWeight: 700,
    color: 'var(--accent)'
  },
  lastMessage: {
    fontSize: 13,
    color: 'var(--text-main)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  empty: {
    padding: 20,
    textAlign: 'center',
    color: 'var(--text-muted)'
  },
  loading: {
    minHeight: '100dvh',
    display: 'grid',
    placeItems: 'center',
    color: 'var(--text-main)'
  }
}
