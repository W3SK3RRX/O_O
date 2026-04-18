import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChatStore } from '../store/chat.store'
import { useSocketStore } from '../store/socket.store'
import { useAuthStore } from '../store/auth.store'

function getOtherParticipant(conv, currentUserId) {
  if (!conv.participants) return null
  return conv.participants.find((p) => p._id?.toString() !== currentUserId?.toString()) ?? null
}

function ConvCard({ conv, currentUserId, onClick }) {
  const unreadCounts = useChatStore((s) => s.unreadCounts)
  const unread = unreadCounts[conv._id] ?? 0
  const other = getOtherParticipant(conv, currentUserId)
  const displayName = conv.isGroup ? conv.name : (other?.name ?? `canal_${conv._id.slice(-4)}`)

  return (
    <div style={styles.chatItem} onClick={onClick}>
      <div style={styles.chatContent}>
        <div style={styles.cardRow}>
          <span style={styles.chatName}>{displayName}</span>
          {unread > 0 && (
            <span style={styles.badge}>{unread > 99 ? '99+' : unread}</span>
          )}
        </div>
        <div style={styles.lastMessage}>
          {'> '}{conv.lastMessage?.cipherText ? '[mensagem criptografada]' : conv.lastMessage?.text || '[sem mensagens]'}
        </div>
      </div>
    </div>
  )
}

export default function ChatList() {
  const navigate = useNavigate()
  const user = useAuthStore(state => state.user)
  const logout = useAuthStore(state => state.logout)
  const connect = useSocketStore(state => state.connect)
  const disconnect = useSocketStore(state => state.disconnect)

  const { conversations, fetchConversations, loading } = useChatStore()

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
            <ConvCard
              key={conv._id}
              conv={conv}
              currentUserId={user?._id}
              onClick={() => navigate(`/chat/${conv._id}`)}
            />
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
    width: '100%',
    maxWidth: 940,
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
    width: 44,
    height: 44,
    cursor: 'pointer',
    flexShrink: 0,
  },
  iconButton: {
    background: 'transparent',
    border: '1px solid var(--border)',
    color: 'var(--text-main)',
    fontSize: 12,
    minWidth: 48,
    height: 44,
    cursor: 'pointer',
  },
  newChatButton: {
    width: 44,
    height: 44,
    border: '1px solid var(--accent-strong)',
    background: 'rgba(0, 255, 90, 0.1)',
    color: 'var(--accent)',
    fontSize: 22,
    cursor: 'pointer',
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
    gap: 6
  },
  chatItem: {
    padding: '8px 12px',
    cursor: 'pointer',
    border: '1px solid rgba(14, 143, 61, 0.6)',
    background: 'rgba(3, 16, 11, 0.8)'
  },
  chatContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3
  },
  cardRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  chatName: {
    fontSize: 13,
    fontWeight: 700,
    color: 'var(--accent)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  badge: {
    background: 'var(--accent)',
    color: '#020907',
    fontSize: 10,
    fontWeight: 700,
    borderRadius: 10,
    padding: '1px 6px',
    flexShrink: 0,
    minWidth: 18,
    textAlign: 'center'
  },
  lastMessage: {
    fontSize: 12,
    color: 'var(--text-muted)',
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
