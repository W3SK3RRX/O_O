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
import { publicKeyFingerprint } from '../crypto/fingerprint'

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
  const [peerFingerprint, setPeerFingerprint] = useState(null)
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
  } = useChatStore()

  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  useEffect(() => {
    if (!socket) {
      connectSocket()
    }
  }, [socket, connectSocket])

  useEffect(() => {
    // Depende apenas de conversationId para não re-disparar (e zerar activeConversation)
    // a cada atualização da lista de conversas.
    setActiveConversation({ _id: conversationId })
    clearUnread(conversationId)
    return () => setActiveConversation(null)
  }, [conversationId, setActiveConversation, clearUnread])

  useEffect(() => {
    let cancelled = false

    // Limpa a chave anterior para não descriptografar a conversa nova com chave antiga
    setConversationKey(null)
    setPeerFingerprint(null)

    const resolveConversationKey = async () => {
      try {
        const conversations = await getConversations()

        if (cancelled) return

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

        // Safety number: fingerprint da chave pública do contato (apenas 1-a-1)
        const others = (conversation.participants || []).filter(
          (p) => (p?._id ?? p) !== user?._id
        )
        if (others.length === 1 && others[0]?.publicKey) {
          const fp = await publicKeyFingerprint(others[0].publicKey)
          if (!cancelled) setPeerFingerprint(fp)
        }

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
            if (!cancelled) setConversationKey(key)
            return
          }

          if (!localKeyBase64) {
            throw new Error('Chave da conversa não encontrada no servidor nem localmente')
          }
        }

        const key = await importConversationKey(localKeyBase64)
        if (!cancelled) setConversationKey(key)
      } catch (error) {
        if (cancelled) return
        console.error('Erro ao carregar chave da conversa:', error)
        alert('Não foi possível carregar a chave da conversa. Tente recriar a conversa.')
        navigate('/')
      }
    }

    resolveConversationKey()

    return () => {
      cancelled = true
    }
  }, [conversationId, navigate, user?._id])

  useEffect(() => {
    fetchMessages(conversationId)
  }, [conversationId, fetchMessages])

  useEffect(() => {
    if (!socket || !conversationKey) return

    // Entra na sala agora e também a cada reconexão. O socket.io reusa a mesma
    // instância no cliente ao reconectar, então sem religar o listener de
    // 'connect' o servidor perderia a sala (rooms são por conexão) e o usuário
    // pararia de receber/ecoar mensagens em tempo real após uma queda.
    const joinRoom = () => {
      socket.emit('joinConversation', conversationId)
      socket.emit('markConversationRead', conversationId)
    }

    joinRoom()
    socket.on('connect', joinRoom)

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
      socket.emit('leaveConversation', conversationId)
      socket.off('connect', joinRoom)
      socket.off('newMessage', handleNewMessage)
      socket.off('messageRead', handleMessageRead)
      socket.off('messageDeleted', handleMessageDeleted)
      socket.off('messageEdited', handleMessageEdited)
      socket.off('userTyping', handleUserTyping)
    }
  }, [socket, conversationKey, conversationId, addMessage, updateLastMessage, markAsRead])

  // Limpa o timeout de digitação ao desmontar
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

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

  // Rola até a última mensagem. Reage também a decryptedMessages: a
  // descriptografia é assíncrona e muda a altura das bolhas depois do load,
  // então sem isso o scroll parava antes do fim. Instantâneo para abrir
  // direto na mensagem mais recente.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
  }, [messages, decryptedMessages])

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
    <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--accent)', padding: '4px 8px', fontStyle: 'italic' }}>
      {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'está' : 'estão'} digitando...
    </div>
  ) : null

  return (
    <div className="screen">
      <div className="shell shell--app">
        <header className="app-header">
          <button className="icon-btn" onClick={() => navigate(-1)} title="Voltar">
            {'<'}
          </button>
          <div className="app-header__identity">
            <strong className="app-header__title">{conversationTitle}</strong>
            <div className="app-header__prompt">root@node:~$ attach {conversationId?.slice(-6)}</div>
            {peerFingerprint && (
              <div
                style={{ fontSize: 'var(--fs-2xs)', color: 'var(--accent)', letterSpacing: 0.5, marginTop: 2, cursor: 'help', wordBreak: 'break-all' }}
                title="Compare este código com seu contato por um canal confiável para verificar a identidade (proteção contra MITM)"
              >
                🔑 {peerFingerprint}
              </div>
            )}
          </div>
        </header>

        <div className="messages">
          {messages.map(msg => (
            <MessageBubble
              key={msg._id}
              message={{
                ...msg,
                text: msg.text ?? decryptedMessages[msg._id] ?? ''
              }}
              isMine={(msg.senderId || msg.sender?._id) === user?._id}
            />
          ))}
          {typingIndicator}
          <div ref={messagesEndRef} />
        </div>

        <div className="composer">
          <input
            placeholder="Digite sua mensagem..."
            className="field composer__input"
            value={text}
            onChange={e => {
              handleTyping()
              setText(e.target.value)
            }}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage} className="composer__send" aria-label="Enviar">
            {'>'}
          </button>
        </div>
      </div>
    </div>
  )
}
