import { useEffect, useRef, useState, useCallback, Fragment } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useChatStore } from '../store/chat.store'
import { useSocketStore } from '../store/socket.store'
import { useAuthStore } from '../store/auth.store'
import MessageBubble from '../components/MessageBubble'
import DaySeparator from '../components/DaySeparator'
import { isSameDay, formatDayLabel } from '../utils/formatDate'

import { getConversation, markConversationRead } from '../api/chat.api'
import { uploadAttachment } from '../api/attachment.api'
import { loadConversationKey, saveConversationKey } from '../crypto/conv-storage'
import { importConversationKey } from '../crypto/conversation'
import { encryptMessage, decryptMessage } from '../crypto/message'
import { encryptFile } from '../crypto/attachment'
import { downscaleImage } from '../utils/image'
import { decryptWithPrivateKey } from '../crypto/envelope'
import { importPrivateKey } from '../crypto/keys'
import { getPrivateKey } from '../crypto/storage'
import { publicKeyFingerprint } from '../crypto/fingerprint'
import { getConversationName } from '../utils/conversation'
import { useNotificationStore } from '../store/notification.store'

// Limite de tamanho de arquivo em claro (o ciphertext cifrado fica um pouco maior;
// o backend recusa acima de ~10MB de ciphertext).
const MAX_FILE_BYTES = 8 * 1024 * 1024 // limite final do anexo (pós-redução)
const MAX_INPUT_BYTES = 25 * 1024 * 1024 // teto bruto de entrada (proteção de memória ao decodificar)

export default function Chat() {
  const { conversationId } = useParams()
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const [conversationKey, setConversationKey] = useState(null)
  const [decryptedMessages, setDecryptedMessages] = useState({})
  const [replyTexts, setReplyTexts] = useState({})
  const [conversationTitle, setConversationTitle] = useState('CHAT_SESSION')
  const [peerFingerprint, setPeerFingerprint] = useState(null)
  const [typingUsers, setTypingUsers] = useState(new Set())
  const [replyingTo, setReplyingTo] = useState(null)
  const [pendingAttachments, setPendingAttachments] = useState([])
  const [uploading, setUploading] = useState(false)
  const [conversationMeta, setConversationMeta] = useState({ participants: [], isGroup: false, reads: {} })

  const user = useAuthStore(state => state.user)
  const socket = useSocketStore(state => state.socket)
  const connectSocket = useSocketStore(state => state.connect)
  const addError = useNotificationStore(state => state.addError)

  const {
    messages,
    fetchMessages,
    addMessage,
    addOptimistic,
    reconcileMessage,
    markMessageFailed,
    markMessagePending,
    updateLastMessage,
    updateReactions,
    markAsRead,
    setActiveConversation,
    clearUnread,
    setPreview,
    loadOlderMessages,
    loadingOlder,
    messagesPagination,
  } = useChatStore()

  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const fileInputRef = useRef(null)
  const pendingTimers = useRef(new Map())
  const anchorRef = useRef(null)
  const lastIdRef = useRef(null)
  // Cache incremental de descriptografia: evita reprocessar o histórico inteiro
  // a cada nova mensagem/reação/recibo. Zerado ao trocar de conversa (chave).
  const decryptedIdsRef = useRef(new Set())
  const replyIdsRef = useRef(new Set())
  const decryptedKeyRef = useRef(null)

  useEffect(() => {
    if (!socket) connectSocket()
  }, [socket, connectSocket])

  useEffect(() => {
    // Depende apenas de conversationId para não re-disparar a cada atualização da lista.
    setActiveConversation({ _id: conversationId })
    clearUnread(conversationId)
    // Captura a última leitura ANTES de marcar como lida (ancora "novas mensagens").
    anchorRef.current = useChatStore.getState().lastReadAts[conversationId] || null
    lastIdRef.current = null
    // Persiste a leitura no servidor (reforço ao socket).
    markConversationRead(conversationId).catch(() => {})
    return () => setActiveConversation(null)
  }, [conversationId, setActiveConversation, clearUnread])

  useEffect(() => {
    let cancelled = false
    setConversationKey(null)
    setPeerFingerprint(null)

    const resolveConversationKey = async () => {
      try {
        // Busca só esta conversa (funciona com qualquer número de conversas).
        const conversation = await getConversation(conversationId)
        if (cancelled) return
        if (!conversation?._id) throw new Error('Conversa não encontrada')

        setConversationTitle(getConversationName(conversation, user?._id))
        setConversationMeta({
          participants: conversation.participants || [],
          isGroup: !!conversation.isGroup,
          reads: conversation.reads || {},
        })

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
            if (!privateKeyBase64) throw new Error('Chave privada local não encontrada')
            const privateKey = await importPrivateKey(privateKeyBase64)
            const decryptedKeyBase64 = await decryptWithPrivateKey(privateKey, encryptedKey)
            if (!decryptedKeyBase64) throw new Error('Não foi possível descriptografar a chave da conversa')
            await saveConversationKey(conversationId, decryptedKeyBase64, serverVersion)
            const key = await importConversationKey(decryptedKeyBase64)
            if (!cancelled) setConversationKey(key)
            return
          }
          if (!localKeyBase64) throw new Error('Chave da conversa não encontrada')
        }

        const key = await importConversationKey(localKeyBase64)
        if (!cancelled) setConversationKey(key)
      } catch (error) {
        if (cancelled) return
        console.error('Erro ao carregar chave da conversa:', error)
        addError('Não foi possível carregar a chave da conversa. Tente recriar a conversa.')
        navigate('/')
      }
    }

    resolveConversationKey()
    return () => { cancelled = true }
  }, [conversationId, navigate, user?._id, addError])

  useEffect(() => {
    fetchMessages(conversationId)
  }, [conversationId, fetchMessages])

  useEffect(() => {
    if (!socket || !conversationKey) return

    const joinRoom = () => {
      socket.emit('joinConversation', conversationId)
      socket.emit('markConversationRead', conversationId)
    }
    joinRoom()
    socket.on('connect', joinRoom)

    const handleNewMessage = async payload => {
      if (payload.conversationId !== conversationId) return
      try {
        if (!payload.cipherText || !payload.iv) return
        const plainText = await decryptMessage(conversationKey, payload.cipherText, payload.iv)
        const message = { ...payload, text: plainText }

        const senderId = (payload.senderId?._id ?? payload.senderId)?.toString()
        if (senderId === user?._id?.toString() && payload.clientId) {
          // Eco da própria mensagem: reconcilia a otimista e cancela o timer de falha.
          const timer = pendingTimers.current.get(payload.clientId)
          if (timer) { clearTimeout(timer); pendingTimers.current.delete(payload.clientId) }
          reconcileMessage(message)
        } else {
          addMessage(message)
          socket.emit('markConversationRead', conversationId)
        }
        updateLastMessage(message)
        setPreview(conversationId, plainText || '[anexo]')
      } catch (e) {
        console.error('Erro ao descriptografar mensagem:', e)
        const message = { ...payload, text: '[mensagem indisponível]', decryptError: true }
        addMessage(message)
        updateLastMessage(message)
      }
    }

    const handleMessageRead = payload => markAsRead(payload.messageId)
    const handleConversationRead = ({ readBy, readAt }) => {
      setConversationMeta(prev => ({ ...prev, reads: { ...prev.reads, [readBy]: readAt } }))
    }
    const handleMessageReaction = ({ messageId, reactions }) => updateReactions(messageId, reactions)
    const handleMessageDeleted = ({ messageId }) => {
      setDecryptedMessages(prev => ({ ...prev, [messageId]: '[mensagem apagada]' }))
    }
    const handleMessageEdited = async ({ messageId, cipherText, iv }) => {
      try {
        const plainText = await decryptMessage(conversationKey, cipherText, iv)
        setDecryptedMessages(prev => ({ ...prev, [messageId]: plainText }))
      } catch (e) {
        console.error('Erro ao descriptografar mensagem editada:', e)
      }
    }
    const handleUserTyping = ({ name, isTyping }) => {
      setTypingUsers(prev => {
        const next = new Set(prev)
        if (isTyping) next.add(name); else next.delete(name)
        return next
      })
    }

    socket.on('newMessage', handleNewMessage)
    socket.on('messageRead', handleMessageRead)
    socket.on('conversationRead', handleConversationRead)
    socket.on('messageReaction', handleMessageReaction)
    socket.on('messageDeleted', handleMessageDeleted)
    socket.on('messageEdited', handleMessageEdited)
    socket.on('userTyping', handleUserTyping)

    return () => {
      socket.emit('leaveConversation', conversationId)
      socket.off('connect', joinRoom)
      socket.off('newMessage', handleNewMessage)
      socket.off('messageRead', handleMessageRead)
      socket.off('conversationRead', handleConversationRead)
      socket.off('messageReaction', handleMessageReaction)
      socket.off('messageDeleted', handleMessageDeleted)
      socket.off('messageEdited', handleMessageEdited)
      socket.off('userTyping', handleUserTyping)
    }
  }, [socket, conversationKey, conversationId, addMessage, reconcileMessage, updateLastMessage, updateReactions, markAsRead, setPreview, user?._id])

  useEffect(() => {
    const timers = pendingTimers.current
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      for (const t of timers.values()) clearTimeout(t)
      timers.clear()
    }
  }, [])

  // Descriptografa apenas mensagens/citações ainda não processadas (incremental).
  useEffect(() => {
    if (!conversationKey || messages.length === 0) return
    let cancelled = false

    // Troca de conversa (nova chave) → zera o cache incremental.
    if (decryptedKeyRef.current !== conversationKey) {
      decryptedKeyRef.current = conversationKey
      decryptedIdsRef.current = new Set()
      replyIdsRef.current = new Set()
    }

    const seen = decryptedIdsRef.current
    const seenReplies = replyIdsRef.current

    const toDecrypt = messages.filter(
      m => !seen.has(m._id) && !(m.text && !m.decryptError) && m.cipherText && m.iv
    )
    const toReply = messages.filter(
      m => m.replyTo && m.replyTo._id && !seenReplies.has(m._id)
    )
    if (toDecrypt.length === 0 && toReply.length === 0) return

    const run = async () => {
      if (toDecrypt.length > 0) {
        const entries = await Promise.all(
          toDecrypt.map(async msg => {
            try {
              return [msg._id, await decryptMessage(conversationKey, msg.cipherText, msg.iv)]
            } catch {
              return [msg._id, '[mensagem indisponível]']
            }
          })
        )
        if (cancelled) return
        entries.forEach(([id]) => seen.add(id))
        setDecryptedMessages(prev => ({ ...prev, ...Object.fromEntries(entries) }))
      }

      if (toReply.length > 0) {
        const replyEntries = await Promise.all(
          toReply.map(async m => {
            if (m.replyTo.cipherText && m.replyTo.iv) {
              try {
                return [m._id, await decryptMessage(conversationKey, m.replyTo.cipherText, m.replyTo.iv)]
              } catch {
                return [m._id, '[mensagem]']
              }
            }
            return [m._id, '[mensagem]']
          })
        )
        if (cancelled) return
        replyEntries.forEach(([id]) => seenReplies.add(id))
        setReplyTexts(prev => ({ ...prev, ...Object.fromEntries(replyEntries) }))
      }
    }

    run()
    return () => { cancelled = true }
  }, [messages, conversationKey])

  // Scroll: desce ao fundo em mensagens novas (append) ou se já estiver perto do fim.
  useEffect(() => {
    const el = messagesContainerRef.current
    const lastId = messages[messages.length - 1]?._id
    const isNew = lastId && lastId !== lastIdRef.current
    if (isNew) lastIdRef.current = lastId
    if (!el) {
      if (isNew) messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
      return
    }
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 200
    if (isNew || nearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
    }
  }, [messages, decryptedMessages])

  // Carrega mensagens anteriores ao chegar no topo, preservando a posição.
  const handleScroll = useCallback(() => {
    const el = messagesContainerRef.current
    if (!el || loadingOlder) return
    if (el.scrollTop < 60) {
      const prevHeight = el.scrollHeight
      loadOlderMessages(conversationId).then(added => {
        if (added > 0) {
          requestAnimationFrame(() => {
            const el2 = messagesContainerRef.current
            if (el2) el2.scrollTop = el2.scrollHeight - prevHeight
          })
        }
      })
    }
  }, [conversationId, loadingOlder, loadOlderMessages])

  const handleTyping = useCallback(() => {
    if (!socket || !conversationId) return
    socket.emit('typing', { conversationId, isTyping: true })
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', { conversationId, isTyping: false })
    }, 2000)
  }, [socket, conversationId])

  const emitSend = useCallback((msg) => {
    if (socket && socket.connected) {
      socket.emit('sendMessage', {
        conversationId,
        cipherText: msg.outgoing.cipherText,
        iv: msg.outgoing.iv,
        replyTo: msg.outgoing.replyTo,
        attachments: msg.outgoing.attachments,
        clientId: msg.clientId,
      })
      const t = setTimeout(() => markMessageFailed(msg.clientId), 12000)
      pendingTimers.current.set(msg.clientId, t)
    } else {
      markMessageFailed(msg.clientId)
    }
  }, [socket, conversationId, markMessageFailed])

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !conversationKey) return
    if (file.size > MAX_INPUT_BYTES) {
      addError('Arquivo muito grande (máximo 25MB).')
      return
    }
    setUploading(true)
    try {
      // Imagens grandes são reduzidas no cliente antes de cifrar: upload e
      // exibição ficam muito mais rápidos, sem abrir mão do E2E.
      const prepared = await downscaleImage(file)
      if (prepared.size > MAX_FILE_BYTES) {
        addError('Arquivo muito grande (máximo 8MB).')
        return
      }
      const enc = await encryptFile(conversationKey, prepared)
      const up = await uploadAttachment({ conversationId, name: enc.name, mime: enc.mime, cipherBuffer: enc.cipherBuffer })
      setPendingAttachments(prev => [...prev, { attachmentId: up.attachmentId, name: enc.name, mime: enc.mime, size: enc.size, iv: enc.iv }])
    } catch (err) {
      addError(err?.response?.data?.error?.message || err?.message || 'Falha ao anexar arquivo')
    } finally {
      setUploading(false)
    }
  }

  const sendMessage = async () => {
    if ((!text.trim() && pendingAttachments.length === 0) || !conversationKey) return
    const clientId = crypto.randomUUID()
    const encrypted = await encryptMessage(conversationKey, text)
    const attachments = pendingAttachments.map(a => ({
      attachmentId: a.attachmentId, name: a.name, mime: a.mime, size: a.size, iv: a.iv,
    }))
    const replyPreview = replyingTo ? {
      _id: replyingTo._id,
      senderName: replyingTo.senderName ?? replyingTo.sender?.name ?? null,
      cipherText: replyingTo.cipherText,
      iv: replyingTo.iv,
      deleted: replyingTo.deleted,
    } : null

    const optimistic = {
      _id: clientId,
      clientId,
      conversationId,
      senderId: user._id,
      senderName: user.name,
      text,
      createdAt: new Date().toISOString(),
      reactions: [],
      attachments,
      replyTo: replyPreview,
      outgoing: { cipherText: encrypted.cipherText, iv: encrypted.iv, replyTo: replyingTo?._id ?? null, attachments },
    }

    addOptimistic(optimistic)
    setPreview(conversationId, text || '[anexo]')
    emitSend(optimistic)

    setText('')
    setReplyingTo(null)
    setPendingAttachments([])
    socket?.emit('typing', { conversationId, isTyping: false })
  }

  const handleRetry = useCallback((msg) => {
    markMessagePending(msg.clientId)
    emitSend(msg)
  }, [emitSend, markMessagePending])

  const handleReact = useCallback((messageId, emoji) => {
    socket?.emit('reactMessage', { messageId, emoji })
  }, [socket])

  const others = (conversationMeta.participants || []).filter(
    p => (p?._id ?? p)?.toString() !== user?._id?.toString()
  )

  const typingIndicator = typingUsers.size > 0 ? (
    <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--accent)', padding: '4px 8px', fontStyle: 'italic' }} aria-live="polite">
      {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'está' : 'estão'} digitando...
    </div>
  ) : null

  // Índice da âncora "novas mensagens": primeira mensagem de outro após a leitura.
  const anchorAt = anchorRef.current ? new Date(anchorRef.current).getTime() : null
  let anchorIndex = -1
  if (anchorAt) {
    anchorIndex = messages.findIndex(m =>
      m.createdAt &&
      new Date(m.createdAt).getTime() > anchorAt &&
      (m.senderId || m.sender?._id) !== user?._id
    )
    if (anchorIndex <= 0) anchorIndex = -1 // não mostra no topo / conversa toda nova
  }

  const hasMoreHistory = messagesPagination && messagesPagination.page < messagesPagination.pages

  return (
    <div className="screen">
      <div className="shell shell--app">
        <header className="app-header">
          <button className="icon-btn" onClick={() => navigate(-1)} title="Voltar" aria-label="Voltar">
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

        <div className="messages" ref={messagesContainerRef} onScroll={handleScroll} role="log" aria-live="polite" aria-label="Mensagens da conversa">
          {loadingOlder && (
            <div style={{ textAlign: 'center', fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', padding: 6 }}>carregando anteriores…</div>
          )}
          {!loadingOlder && hasMoreHistory && (
            <div style={{ textAlign: 'center', padding: 6 }}>
              <button onClick={() => loadOlderMessages(conversationId)} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 'var(--fs-2xs)', padding: '2px 8px' }}>
                carregar mensagens anteriores
              </button>
            </div>
          )}
          {messages.map((msg, i) => {
            const prev = messages[i - 1]
            const showSeparator =
              msg.createdAt &&
              (!prev?.createdAt || !isSameDay(new Date(prev.createdAt), new Date(msg.createdAt)))
            return (
              <Fragment key={msg._id}>
                {showSeparator && <DaySeparator label={formatDayLabel(msg.createdAt)} />}
                {i === anchorIndex && <DaySeparator label="novas mensagens" />}
                <MessageBubble
                  message={{ ...msg, text: msg.text ?? decryptedMessages[msg._id] ?? '' }}
                  isMine={(msg.senderId || msg.sender?._id) === user?._id}
                  currentUserId={user?._id}
                  conversationKey={conversationKey}
                  quotedText={replyTexts[msg._id]}
                  others={others}
                  reads={conversationMeta.reads}
                  isGroup={conversationMeta.isGroup}
                  onReply={setReplyingTo}
                  onReact={handleReact}
                  onRetry={handleRetry}
                />
              </Fragment>
            )
          })}
          {typingIndicator}
          <div ref={messagesEndRef} />
        </div>

        {/* Banner de resposta */}
        {replyingTo && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderTop: '1px solid var(--border)', background: 'rgba(0,255,90,0.05)' }}>
            <div style={{ flex: 1, minWidth: 0, fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              ↩ respondendo: {replyTexts[replyingTo._id] ?? decryptedMessages[replyingTo._id] ?? '…'}
            </div>
            <button onClick={() => setReplyingTo(null)} className="icon-btn" aria-label="Cancelar resposta" style={{ width: 'auto', padding: '0 8px' }}>×</button>
          </div>
        )}

        {/* Chips de anexos pendentes */}
        {pendingAttachments.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '6px 10px', borderTop: '1px solid var(--border)' }}>
            {pendingAttachments.map((a, idx) => (
              <span key={a.attachmentId} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 'var(--fs-2xs)', border: '1px solid var(--border)', padding: '2px 6px', color: 'var(--text-main)' }}>
                📎 {a.name}
                <button onClick={() => setPendingAttachments(prev => prev.filter((_, i) => i !== idx))} aria-label={`Remover ${a.name}`} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>×</button>
              </span>
            ))}
          </div>
        )}

        <form
          className="composer"
          onSubmit={(e) => { e.preventDefault(); sendMessage() }}
        >
          <input ref={fileInputRef} type="file" onChange={handleFileSelect} style={{ display: 'none' }} aria-hidden="true" tabIndex={-1} />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="icon-btn"
            aria-label="Anexar arquivo"
            title="Anexar arquivo"
            disabled={uploading || !conversationKey}
          >
            {uploading ? '…' : '📎'}
          </button>
          <textarea
            placeholder="Digite sua mensagem..."
            title="Enter envia • Shift+Enter quebra linha"
            className="field composer__input"
            aria-label="Mensagem (Enter envia, Shift+Enter quebra linha)"
            rows={1}
            style={{ resize: 'none' }}
            value={text}
            onChange={e => { handleTyping(); setText(e.target.value) }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
          />
          <button
            type="submit"
            className="composer__send"
            aria-label="Enviar mensagem"
            disabled={(!text.trim() && pendingAttachments.length === 0) || !conversationKey}
          >
            {'>'}
          </button>
        </form>
      </div>
    </div>
  )
}
