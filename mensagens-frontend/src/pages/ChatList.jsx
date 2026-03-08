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
          <button
            style={styles.backButton}
            onClick={() => navigate(-1)}
            title="Voltar"
          >
            {'<'}
          </button>

          <div style={styles.identity}>
            <div style={styles.prompt}>[USER: {user?.name || 'local'}]</div>
            <strong style={styles.title}>CONVERSAS</strong>
          </div>

          <div style={styles.headerActions}>
            {user?.role === 'admin' && (
              <button
                style={styles.iconButton}
                onClick={() => navigate('/admin')}
                title="Painel Admin"
              >
                ADM
              </button>
            )}

            <button
              style={styles.iconButton}
              onClick={handleLogout}
              title="Sair"
            >
              EXIT
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
          SYSTEM_ONLINE :: sessão ativa <strong>{user?.name}</strong>
        </div>

        <div style={styles.list}>
          {conversations.length === 0 && (
            <p style={styles.empty}>{'>'} nenhum canal encontrado</p>
          )}

          {conversations.map(conv => (
            <div
              key={conv._id}
              style={styles.chatItem}
              onClick={() => navigate(`/chat/${conv._id}`)}
            >
              <div style={styles.chatContent}>
                <div style={styles.chatName}>
                  root@chat:~$ open convo_{conv._id.slice(-4)}
                </div>

                <div style={styles.lastMessage}>
                  {'> '} {conv.lastMessage?.text || '[sem mensagens]'}
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
    padding: '16px 10px',
    display: 'flex',
    justifyContent: 'center'
  },
  shell: {
    width: 'min(100%, 940px)',
    border: '1px solid var(--border)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(180deg, rgba(2, 18, 13, 0.98), rgba(0, 9, 6, 0.98))',
    boxShadow: '0 0 18px rgba(0, 255, 90, 0.12), inset 0 0 20px rgba(0, 255, 90, 0.04)'
  },
  header: {
    padding: '12px 14px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap'
  },
  identity: {
    flex: 1,
    minWidth: 180
  },
  prompt: {
    color: 'var(--accent)',
    fontSize: 12,
    marginBottom: 2
  },
  title: {
    fontSize: 18,
    letterSpacing: 1
  },
  headerActions: {
    display: 'flex',
    gap: 8
  },
  backButton: {
    background: 'transparent',
    border: '1px solid var(--border)',
    color: 'var(--accent)',
    fontSize: 18,
    width: 36,
    height: 36,
    cursor: 'pointer'
  },
  iconButton: {
    background: 'transparent',
    border: '1px solid var(--border)',
    color: 'var(--text-main)',
    fontSize: 12,
    minWidth: 48,
    height: 36,
    cursor: 'pointer'
  },
  newChatButton: {
    width: 36,
    height: 36,
    border: '1px solid var(--accent-strong)',
    background: 'rgba(0, 255, 90, 0.1)',
    color: 'var(--accent)',
    fontSize: 22,
    cursor: 'pointer'
  },
  subheader: {
    padding: '10px 14px',
    fontSize: 12,
    color: 'var(--text-muted)',
    borderBottom: '1px solid rgba(14, 143, 61, 0.5)'
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    padding: 10,
    display: 'grid',
    gap: 8
  },
  chatItem: {
    padding: '12px',
    cursor: 'pointer',
    border: '1px solid rgba(14, 143, 61, 0.6)',
    background: 'rgba(3, 16, 11, 0.8)'
  },
  chatContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6
  },
  chatName: {
    fontSize: 12,
    fontWeight: 700,
    color: 'var(--accent)'
  },
  lastMessage: {
    fontSize: 14,
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
