import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChatStore } from '../store/chat.store'
import { useSocketStore } from '../store/socket.store'
import { useAuthStore } from '../store/auth.store'
import { getConversationName } from '../utils/conversation'

const formatTime = (dateStr) => {
  if (!dateStr) return '--'
  return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export default function ChatList() {
  const navigate = useNavigate()
  const user = useAuthStore(state => state.user)
  const logout = useAuthStore(state => state.logout)
  const connect = useSocketStore(state => state.connect)
  const disconnect = useSocketStore(state => state.disconnect)
  const socket = useSocketStore(state => state.socket)

  const { conversations, fetchConversations, loading, error, unreadCounts, clearUnread, previews } = useChatStore()

  useEffect(() => {
    connect()
    fetchConversations()
  }, [connect, fetchConversations])

  // Recarrega as conversas quando o app volta ao foco e quando o socket
  // reconecta. Cobre o cold-open do PWA (rede ainda não pronta na 1ª tentativa)
  // e quedas de conexão — sem isso, uma falha transitória deixa a lista vazia.
  useEffect(() => {
    const refetch = () => {
      if (document.visibilityState === 'visible') fetchConversations()
    }
    window.addEventListener('focus', refetch)
    document.addEventListener('visibilitychange', refetch)
    if (socket) socket.on('connect', fetchConversations)
    return () => {
      window.removeEventListener('focus', refetch)
      document.removeEventListener('visibilitychange', refetch)
      if (socket) socket.off('connect', fetchConversations)
    }
  }, [socket, fetchConversations])

  const handleLogout = () => {
    disconnect()
    logout()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="screen" style={{ alignItems: 'center' }}>
        <span style={{ color: 'var(--text-main)' }}>Carregando conversas...</span>
      </div>
    )
  }

  return (
    <div className="screen">
      <div className="shell shell--app">
        <header className="app-header">
          <button className="icon-btn" onClick={() => navigate(-1)} title="Voltar">
            {'<'}
          </button>

          <div className="app-header__identity">
            <div className="app-header__prompt">[USER: {user?.name || 'local'}]</div>
            <strong className="app-header__title">CONVERSAS</strong>
          </div>

          <div className="app-header__actions">
            {user?.role === 'admin' && (
              <button className="icon-btn" onClick={() => navigate('/admin')} title="Painel Admin" style={{ fontSize: 'var(--fs-xs)', width: 'auto', padding: '0 var(--sp-2)' }}>
                ADM
              </button>
            )}

            <button className="icon-btn" onClick={handleLogout} title="Sair" style={{ fontSize: 'var(--fs-xs)', width: 'auto', padding: '0 var(--sp-2)' }}>
              EXIT
            </button>

            {/* "+" no cabeçalho apenas no desktop; no mobile usa-se o FAB */}
            <button className="icon-btn hide-mobile" onClick={() => navigate('/new-chat')} title="Nova conversa">
              +
            </button>
          </div>
        </header>

        <div className="subheader">
          SYSTEM_ONLINE :: sessão ativa <strong>{user?.name}</strong>
        </div>

        <div className="list">
          {conversations.length === 0 && error && (
            <div className="empty-text" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', alignItems: 'flex-start' }}>
              <span>{'>'} falha ao carregar conversas</span>
              <button
                className="icon-btn"
                onClick={() => fetchConversations()}
                style={{ width: 'auto', padding: '0 var(--sp-2)', fontSize: 'var(--fs-xs)' }}
              >
                tentar de novo
              </button>
            </div>
          )}

          {conversations.length === 0 && !error && (
            <p className="empty-text">{'>'} nenhum canal encontrado</p>
          )}

          {conversations.map(conv => {
            const name = getConversationName(conv, user?._id)
            const unread = unreadCounts[conv._id] ?? 0
            const time = formatTime(conv.lastMessage?.createdAt)
            const lastMsg = previews[conv._id] || '[mensagem criptografada]'

            const open = () => {
              clearUnread(conv._id)
              navigate(`/chat/${conv._id}`)
            }
            return (
              <div
                key={conv._id}
                className={`list-row${unread > 0 ? ' list-row--unread' : ''}`}
                role="button"
                tabIndex={0}
                aria-label={`Abrir conversa com ${name}${unread > 0 ? `, ${unread} não lidas` : ''}`}
                onClick={open}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open() }
                }}
              >
                <div style={{ gridColumn: 1, gridRow: 1, fontSize: 'var(--fs-sm)', fontWeight: 700, color: 'var(--accent)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                <div style={{ gridColumn: 2, gridRow: 1, fontSize: 'var(--fs-2xs)', color: 'var(--text-muted)', textAlign: 'right' }}>{time}</div>
                <div style={{ gridColumn: 1, gridRow: 2, fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{'> '}{lastMsg}</div>
                {unread > 0 && (
                  <div style={{ gridColumn: 2, gridRow: 2, justifySelf: 'end', background: 'var(--accent)', color: '#010805', fontSize: 'var(--fs-2xs)', fontWeight: 700, padding: '2px 7px', minWidth: 20, textAlign: 'center' }}>
                    {unread > 99 ? '99+' : unread}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* FAB de nova conversa (alcance do polegar) — só no mobile */}
      <button className="fab show-mobile" onClick={() => navigate('/new-chat')} title="Nova conversa" aria-label="Nova conversa">
        +
      </button>
    </div>
  )
}
