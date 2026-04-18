import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useChatStore } from '../store/chat.store'
import { useSocketStore } from '../store/socket.store'
import { useAuthStore } from '../store/auth.store'
import MessageBubble from '../components/MessageBubble'

import { getConversations } from '../api/chat.api'
import { loadConversationKey, saveConversationKey } from '../crypto/conv-storage'
import { importConversationKey } from '../crypto/conversation'
import { encryptMessage, decryptMessage } from '../crypto/message'
import { decryptWithPrivateKey } from '../crypto/envelope'
import { importPrivateKey } from '../crypto/keys'
import { getPrivateKey } from '../crypto/storage'

const getConversationTitle = (conversation, currentUserId) => {
  if (!conversation) return 'CHAT_SESSION'

  const candidates =
    conversation.participants ||
    conversation.users ||
    conversation.members ||
    []

  const names = candidates
    .filter(p => {
      const id = p?._id || p?.id || p
      return id && id !== currentUserId
    })
    .map(p => p?.name || p?.username)
    .filter(Boolean)

  if (names.length > 0) {
    return names.join(' • ')
  }

  return `Conversa #${conversation._id?.slice(-4) || ''}`
}

export default function Chat() {
  const { conversationId } = useParams()
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const [conversationKey, setConversationKey] = useState(null)
  const [decryptedMessages, setDecryptedMessages] = useState({})
  const [conversationTitle, setConversationTitle] = useState('CHAT_SESSION')
  const [typingUsers, setTypingUsers] = useState(new Set())

  const user = useAuthStore(state => state.user)
  const socket = useSocketStore(state => state.socket)
  const connectSocket = useSocketStore(state => state.connect)

  const {
    messages,
    fetchMessages,
    addMessage,
    updateLastMessage,
    markAsRead,
    setActiveConversation,
    clearUnread,
    conversations,
  } = useChatStore()

  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  useEffect(() => {
    if (!socket) {
      connectSocket()
    }
  }, [socket, connectSocket])

  useEffect(() => {
    const conv = conversations.find((c) => c._id === conversationId) ?? { _id: conversationId }
    setActiveConversation(conv)
    clearUnread(conversationId)
    return () => setActiveConversation(null)
  }, [conversationId, conversations, setActiveConversation, clearUnread])

  useEffect(() => {
    const resolveConversationKey = async () => {
      try {
        const conversations = await getConversations()
        
        if (!Array.isArray(conversations)) {
          console.error('getConversations não retornou array:', conversations)
          throw new Error('Erro ao buscar conversas')
        }

        const conversation = conversations.find(c => c._id === conversationId)
        
        if (!conversation) {
          console.error('Conversa não encontrada:', conversationId)
          throw new Error('Conversa não encontrada')
        }

        setConversationTitle(getConversationTitle(conversation, user?._id))

        const localData = await loadConversationKey(conversationId)
        const localKeyBase64 = localData?.key
        const localVersion = localData?.version
        const serverVersion = conversation.keyVersion
        const needsRefresh = !localKeyBase64 || localVersion !== serverVersion

        if (needsRefresh) {
          const encryptedKey = conversation?.encryptedKeys?.[user._id]

          if (encryptedKey) {
            const privateKeyBase64 = await getPrivateKey()
            if (!privateKeyBase64) {
              throw new Error('Chave privada local não encontrada')
            }

            const privateKey = await importPrivateKey(privateKeyBase64)
            const decryptedKeyBase64 = await decryptWithPrivateKey(
              privateKey,
              encryptedKey
            )

            if (!decryptedKeyBase64) {
              throw new Error('Não foi possível descriptografar a chave da conversa')
            }

            await saveConversationKey(conversationId, decryptedKeyBase64, serverVersion)
            const key = await importConversationKey(decryptedKeyBase64)
            setConversationKey(key)
            return
          }

          if (!localKeyBase64) {
            throw new Error('Chave da conversa não encontrada no servidor nem localmente')
          }
        }

        const key = await importConversationKey(localKeyBase64)
        setConversationKey(key)
      } catch (error) {
        console.error('Erro ao carregar chave da conversa:', error)
        alert('Não foi possível carregar a chave da conversa. Tente recriar a conversa.')
        navigate('/')
      }
    }

    resolveConversationKey()
  }, [conversationId, navigate, user?._id])

  useEffect(() => {
    fetchMessages(conversationId)
  }, [conversationId, fetchMessages])

  useEffect(() => {
    if (!socket || !conversationKey) return

    socket.emit('joinConversation', conversationId)
    socket.emit('markConversationRead', conversationId)

    const handleNewMessage = async payload => {
      if (payload.conversationId !== conversationId) return

      try {
        if (!payload.cipherText || !payload.iv) {
          return
        }

        const plainText = await decryptMessage(
          conversationKey,
          payload.cipherText,
          payload.iv
        )
        const message = { ...payload, text: plainText }
        addMessage(message)
        updateLastMessage(message)
        socket.emit('markConversationRead', conversationId)
      } catch (e) {
        console.error('Erro ao descriptografar mensagem:', e)
        const message = { ...payload, text: '[mensagem indisponível]', decryptError: true }
        addMessage(message)
        updateLastMessage(message)
      }
    }

    const handleMessageRead = payload => {
      markAsRead(payload.messageId)
    }

    const handleMessageDeleted = ({ messageId }) => {
      setDecryptedMessages(prev => ({
        ...prev,
        [messageId]: '[mensagem apagada]'
      }))
    }

    const handleMessageEdited = async ({ messageId, cipherText, iv }) => {
      try {
        const plainText = await decryptMessage(conversationKey, cipherText, iv)
        setDecryptedMessages(prev => ({
          ...prev,
          [messageId]: plainText
        }))
      } catch (e) {
        console.error('Erro ao descriptografar mensagem editada:', e)
      }
    }

    const handleUserTyping = ({ name, isTyping }) => {
      setTypingUsers(prev => {
        const next = new Set(prev)
        if (isTyping) {
          next.add(name)
        } else {
          next.delete(name)
        }
        return next
      })
    }

    socket.on('newMessage', handleNewMessage)
    socket.on('messageRead', handleMessageRead)
    socket.on('messageDeleted', handleMessageDeleted)
    socket.on('messageEdited', handleMessageEdited)
    socket.on('userTyping', handleUserTyping)

    return () => {
      socket.off('newMessage', handleNewMessage)
      socket.off('messageRead', handleMessageRead)
      socket.off('messageDeleted', handleMessageDeleted)
      socket.off('messageEdited', handleMessageEdited)
      socket.off('userTyping', handleUserTyping)
    }
  }, [socket, conversationKey, conversationId, addMessage, updateLastMessage, markAsRead])

  useEffect(() => {
    if (!conversationKey || messages.length === 0) return

    let cancelled = false

    const decryptLoadedMessages = async () => {
      const decryptedEntries = await Promise.all(
        messages.map(async msg => {
          if (msg.text && !msg.decryptError) return [msg._id, msg.text]
          
          if (!msg.cipherText || !msg.iv) {
            return [msg._id, '[mensagem indisponível]']
          }

          try {
            const plainText = await decryptMessage(
              conversationKey,
              msg.cipherText,
              msg.iv
            )
            return [msg._id, plainText]
          } catch {
            return [msg._id, '[mensagem indisponível]']
          }
        })
      )

      if (!cancelled) {
        setDecryptedMessages(Object.fromEntries(decryptedEntries))
      }
    }

    decryptLoadedMessages()

    return () => {
      cancelled = true
    }
  }, [messages, conversationKey])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleTyping = useCallback(() => {
    if (!socket || !conversationId) return
    
    socket.emit('typing', { conversationId, isTyping: true })
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', { conversationId, isTyping: false })
    }, 2000)
  }, [socket, conversationId])

  const sendMessage = async () => {
    if (!text.trim() || !socket || !conversationKey) return

    const encrypted = await encryptMessage(conversationKey, text)

    socket.emit('sendMessage', {
      conversationId,
      ...encrypted
    })

    setText('')
    socket.emit('typing', { conversationId, isTyping: false })
  }

  const typingIndicator = typingUsers.size > 0 ? (
    <div style={styles.typingIndicator}>
      {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'está' : 'estão'} digitando...
    </div>
  ) : null

  return (
    <div style={styles.container}>
      <div style={styles.shell}>
        <div style={styles.header}>
          <button style={styles.backButton} onClick={() => navigate(-1)} title="Voltar">
            {'<'}
          </button>
          <div>
            <strong style={styles.title}>{conversationTitle}</strong>
            <div style={styles.prompt}>root@node:~$ attach {conversationId?.slice(-6)}</div>
          </div>
        </div>

        <div style={styles.messages}>
          {messages.map(msg => (
            <MessageBubble
              key={msg._id}
              message={{
                ...msg,
                text: msg.text ?? decryptedMessages[msg._id] ?? ''
              }}
              isMine={(msg.senderId || msg.sender?._id) === user._id}
            />
          ))}
          {typingIndicator}
          <div ref={messagesEndRef} />
        </div>

        <div style={styles.input}>
          <input
            placeholder="Digite sua mensagem..."
            style={styles.textInput}
            value={text}
            onChange={e => {
              handleTyping()
              setText(e.target.value)
            }}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage} style={styles.sendButton}>
            {'>'}
          </button>
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
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid var(--border)',
    overflow: 'hidden',
    background: 'linear-gradient(180deg, rgba(2, 18, 13, 0.98), rgba(0, 9, 6, 0.98))',
    minHeight: 'calc(100dvh - 32px)',
    boxShadow: '0 0 18px rgba(0, 255, 90, 0.12), inset 0 0 20px rgba(0, 255, 90, 0.04)'
  },
  header: {
    padding: '12px 14px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: 'rgba(1, 12, 8, 0.94)'
  },
  title: {
    fontSize: 14,
    display: 'block',
    letterSpacing: 1
  },
  prompt: {
    color: 'var(--text-muted)',
    fontSize: 12
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
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  typingIndicator: {
    fontSize: 12,
    color: 'var(--accent)',
    padding: '4px 8px',
    fontStyle: 'italic'
  },
  input: {
    display: 'flex',
    gap: 8,
    padding: 10,
    borderTop: '1px solid var(--border)',
    background: 'rgba(1, 12, 8, 0.94)'
  },
  textInput: {
    flex: 1,
    minWidth: 0,
    padding: '11px 12px',
    fontSize: 15,
    border: '1px solid var(--border)',
    outline: 'none',
    background: '#010805',
    color: 'var(--text-main)'
  },
  sendButton: {
    width: 44,
    height: 44,
    border: '1px solid var(--accent-strong)',
    background: 'rgba(0, 255, 90, 0.12)',
    color: 'var(--accent)',
    fontSize: 21,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }
}
