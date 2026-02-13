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

        if (decryptedKeyBase64 !== localKeyBase64) {
          await saveConversationKey(conversationId, decryptedKeyBase64)
        }

        const key = await importConversationKey(decryptedKeyBase64)
        setConversationKey(key)
        return
      }

      if (!localKeyBase64) {
        throw new Error('Chave da conversa não encontrada')
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
    <div>
      {messages.map(msg => (
        <MessageBubble
          key={msg._id}
          message={{ ...msg, text: msg.text ?? decryptedMessages[msg._id] ?? '' }}
          isMine={(msg.senderId || msg.sender?._id) === user._id}
        />
      ))}
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && sendMessage()}
      />
      <div ref={messagesEndRef} />
    </div>
  )
}


const styles = {
  container: {
    height: '100dvh',
    maxWidth: 480,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    background: '#000'
  },
  header: {
    padding: '12px 16px',
    borderBottom: '1px solid #1f2933',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: '#0b0f1a',
    color: '#fff'
  },
  backButton: {
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: 18,
    cursor: 'pointer'
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: 12,
    background: 'linear-gradient(#0b0f1a, #000)'
  },
  input: {
    display: 'flex',
    gap: 8,
    padding: 10,
    borderTop: '1px solid #1f2933',
    background: '#0b0f1a'
  },
  textInput: {
    flex: 1,
    padding: '12px 16px',
    fontSize: 16,
    borderRadius: 20,
    border: 'none',
    outline: 'none',
    background: '#1f2437',
    color: '#fff'
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    border: 'none',
    background: '#2e7d32',
    color: '#fff',
    fontSize: 16,
    cursor: 'pointer'
  }
}
