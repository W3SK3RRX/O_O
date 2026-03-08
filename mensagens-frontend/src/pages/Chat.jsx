import { useEffect, useRef, useState } from 'react'
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

export default function Chat() {
  const { conversationId } = useParams()
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const [conversationKey, setConversationKey] = useState(null)
  const [decryptedMessages, setDecryptedMessages] = useState({})

  const user = useAuthStore(state => state.user)
  const socket = useSocketStore(state => state.socket)
  const connectSocket = useSocketStore(state => state.connect)

  const {
    messages,
    fetchMessages,
    addMessage,
    updateLastMessage
  } = useChatStore()

  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (!socket) {
      connectSocket()
    }
  }, [socket, connectSocket])

  useEffect(() => {
    const resolveConversationKey = async () => {
      const localKeyBase64 = await loadConversationKey(conversationId)

      if (!localKeyBase64) {
        const conversations = await getConversations()
        const conversation = conversations.find(c => c._id === conversationId)
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

          await saveConversationKey(conversationId, decryptedKeyBase64)

          const key = await importConversationKey(decryptedKeyBase64)
          setConversationKey(key)
          return
        } else {
          throw new Error('Chave da conversa não encontrada no servidor nem localmente')
        }
      }

      const key = await importConversationKey(localKeyBase64)
      setConversationKey(key)
    }

    resolveConversationKey().catch(error => {
      console.error('Erro ao carregar chave da conversa', error)
      alert('Não foi possível carregar a chave da conversa. Tente recriar a conversa.')
      navigate('/')
    })
  }, [conversationId, navigate, user?._id])

  useEffect(() => {
    fetchMessages(conversationId)
  }, [conversationId, fetchMessages])

  useEffect(() => {
    if (!socket || !conversationKey) return

    socket.emit('joinConversation', conversationId)

    const handleNewMessage = async payload => {
      if (payload.conversationId !== conversationId) return

      try {
        const plainText = await decryptMessage(
          conversationKey,
          payload.cipherText,
          payload.iv
        )

        const message = { ...payload, text: plainText }
        addMessage(message)
        updateLastMessage(message)
      } catch {
        const message = { ...payload, text: '[mensagem indisponível]' }
        addMessage(message)
        updateLastMessage(message)
      }
    }

    socket.on('newMessage', handleNewMessage)
    return () => socket.off('newMessage', handleNewMessage)
  }, [socket, conversationKey, conversationId, addMessage, updateLastMessage])

  useEffect(() => {
    if (!conversationKey || messages.length === 0) return

    let cancelled = false

    const decryptLoadedMessages = async () => {
      const decryptedEntries = await Promise.all(
        messages.map(async msg => {
          if (msg.text) return [msg._id, msg.text]
          if (!msg.cipherText || !msg.iv) return [msg._id, '']

          try {
            const plainText = await decryptMessage(
              conversationKey,
              msg.cipherText,
              msg.iv
            )
            return [msg._id, plainText]
          } catch (error) {
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

  const sendMessage = async () => {
    if (!text.trim() || !socket || !conversationKey) return

    const encrypted = await encryptMessage(conversationKey, text)

    socket.emit('sendMessage', {
      conversationId,
      ...encrypted
    })

    setText('')
  }

  return (
    <div style={styles.container}>
      <div style={styles.shell}>
        <div style={styles.header}>
          <button style={styles.backButton} onClick={() => navigate('/')}>
            ←
          </button>
          <div>
            <strong style={styles.title}>Conversa</strong>
            <div style={styles.prompt}>chat@secure:~/{conversationId?.slice(-6)}</div>
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
          <div ref={messagesEndRef} />
        </div>

        <div style={styles.input}>
          <input
            placeholder="Digite sua mensagem..."
            style={styles.textInput}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage} style={styles.sendButton}>
            ➤
          </button>
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
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid var(--border)',
    borderRadius: 14,
    overflow: 'hidden',
    background: 'linear-gradient(180deg, rgba(17, 28, 45, 0.96), rgba(8, 13, 22, 0.97))',
    minHeight: 'calc(100dvh - 36px)'
  },
  header: {
    padding: '12px 16px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: 'rgba(10, 17, 29, 0.95)'
  },
  title: {
    fontSize: 15,
    display: 'block'
  },
  prompt: {
    color: 'var(--accent)',
    fontSize: 12
  },
  backButton: {
    background: 'var(--bg-main)',
    border: '1px solid var(--border)',
    color: 'var(--text-main)',
    fontSize: 18,
    width: 34,
    height: 34,
    borderRadius: 8,
    cursor: 'pointer'
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: 12,
    backgroundImage: 'linear-gradient(rgba(91, 231, 169, 0.07) 1px, transparent 1px)',
    backgroundSize: '100% 30px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6
  },
  input: {
    display: 'flex',
    gap: 8,
    padding: 10,
    borderTop: '1px solid var(--border)',
    background: 'rgba(10, 17, 29, 0.95)'
  },
  textInput: {
    flex: 1,
    minWidth: 0,
    padding: '11px 14px',
    fontSize: 14,
    borderRadius: 10,
    border: '1px solid var(--border)',
    outline: 'none',
    background: 'var(--bg-main)',
    color: 'var(--text-main)'
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 10,
    border: '1px solid var(--accent-strong)',
    background: 'linear-gradient(180deg, #4dd89b 0%, #2ca171 100%)',
    color: '#06281d',
    fontSize: 18,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
}
