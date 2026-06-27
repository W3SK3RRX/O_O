import { useState } from 'react'
import { searchUsers } from '../api/user.api'
import {
  createConversation,
  createGroup,
  saveConversationKeys
} from '../api/chat.api'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'

import {
  generateConversationKey,
  exportConversationKey
} from '../crypto/conversation'
import { decryptWithPrivateKey, encryptWithPublicKey } from '../crypto/envelope'
import { importPrivateKey, importPublicKey } from '../crypto/keys'
import { saveConversationKey } from '../crypto/conv-storage'
import { getPrivateKey, getPublicKey } from '../crypto/storage'

export default function NewChat() {
  const [mode, setMode] = useState('chat') // 'chat' ou 'group'
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [groupName, setGroupName] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const user = useAuthStore(state => state.user)

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    try {
      const users = await searchUsers(query)
      setResults(users.filter(u => u._id !== user._id))
    } catch (err) {
      console.error('Erro ao buscar usuários', err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const toggleUser = (u) => {
    setSelectedUsers(prev => {
      const exists = prev.find(x => x._id === u._id)
      if (exists) {
        return prev.filter(x => x._id !== u._id)
      }
      return [...prev, u]
    })
  }

  const resolveTargetUser = async targetUser => {
    if (targetUser.publicKey) return targetUser

    const fallbackSearch = targetUser.email || targetUser.name
    if (!fallbackSearch) return targetUser

    const refreshedUsers = await searchUsers(fallbackSearch)
    return refreshedUsers.find(u => u._id === targetUser._id) || targetUser
  }

  const startConversation = async targetUser => {
    setLoading(true)
    try {
      const targetUserWithKey = await resolveTargetUser(targetUser)

      if (!targetUserWithKey.publicKey) {
        alert('Este usuário ainda não inicializou a criptografia. Peça para ele fazer login primeiro.')
        return
      }

      const conversation = await createConversation(targetUserWithKey._id)

      const existingEncryptedKey = conversation?.encryptedKeys?.[user._id]
      const existingVersion = conversation?.keyVersion

      if (existingEncryptedKey) {
        const privateKeyBase64 = await getPrivateKey()

        if (!privateKeyBase64) {
          throw new Error('Chave privada local não encontrada para descriptografar conversa existente')
        }

        const privateKey = await importPrivateKey(privateKeyBase64)
        const conversationKeyBase64 = await decryptWithPrivateKey(privateKey, existingEncryptedKey)

        const resolvedVersion = existingVersion ?? Date.now()

        if (!existingVersion) {
          await saveConversationKeys(
            conversation._id,
            conversation.encryptedKeys || {},
            resolvedVersion
          )
        }

        await saveConversationKey(conversation._id, conversationKeyBase64, resolvedVersion)
        navigate(`/chat/${conversation._id}`)
        return
      }

      const conversationKey = await generateConversationKey()
      const conversationKeyBase64 = await exportConversationKey(conversationKey)

      const encryptedKeys = {}

      const localPublicKey = await getPublicKey()
      const participants = [
        { ...user, publicKey: user.publicKey || localPublicKey },
        targetUserWithKey,
      ]

      for (const participant of participants) {
        if (!participant.publicKey) {
          throw new Error(`Usuário ${participant.name} não possui publicKey`)
        }

        const publicKey = await importPublicKey(participant.publicKey)
        encryptedKeys[participant._id] = await encryptWithPublicKey(publicKey, conversationKeyBase64)
      }

      const keyVersion = Date.now()
      await saveConversationKeys(conversation._id, encryptedKeys, keyVersion)
      await saveConversationKey(conversation._id, conversationKeyBase64, keyVersion)

      navigate(`/chat/${conversation._id}`)
    } catch (err) {
      console.error('Erro ao iniciar conversa segura', err)
      alert('Erro ao iniciar conversa')
    } finally {
      setLoading(false)
    }
  }

  const createNewGroup = async () => {
    if (!groupName.trim() || selectedUsers.length < 2) {
      alert('Nome do grupo e pelo menos 2 participantes são obrigatórios')
      return
    }

    setLoading(true)
    try {
      const group = await createGroup(groupName, selectedUsers.map(u => u._id))

      const conversationKey = await generateConversationKey()
      const conversationKeyBase64 = await exportConversationKey(conversationKey)

      const encryptedKeys = {}
      const localPublicKey = await getPublicKey()
      
      const allParticipants = [
        { ...user, _id: user._id, publicKey: user.publicKey || localPublicKey },
        ...selectedUsers
      ]

      for (const participant of allParticipants) {
        if (!participant.publicKey) {
          console.warn(`Usuário ${participant.name} não possui publicKey, pulando...`)
          continue
        }

        const publicKey = await importPublicKey(participant.publicKey)
        encryptedKeys[participant._id] = await encryptWithPublicKey(publicKey, conversationKeyBase64)
      }

      await saveConversationKeys(group._id, encryptedKeys, Date.now())
      await saveConversationKey(group._id, conversationKeyBase64, Date.now())

      navigate(`/chat/${group._id}`)
    } catch (err) {
      console.error('Erro ao criar grupo', err)
      alert('Erro ao criar grupo')
    } finally {
      setLoading(false)
    }
  }

  const tabStyle = (active) => ({
    flex: 1,
    border: 'none',
    borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
    background: active ? 'rgba(0, 255, 90, 0.1)' : 'transparent',
    color: active ? 'var(--accent)' : 'var(--text-muted)',
  })

  return (
    <div className="screen">
      <div className="shell shell--app">
        <header className="app-header">
          <button className="icon-btn" onClick={() => navigate(-1)} title="Voltar">{'<'}</button>
          <div className="app-header__identity">
            <strong className="app-header__title">NOVA CONVERSA</strong>
            <div className="app-header__prompt">root@secure:~$ create_channel --encrypted</div>
          </div>
        </header>

        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
          <button
            className="btn"
            style={tabStyle(mode === 'chat')}
            onClick={() => { setMode('chat'); setSelectedUsers([]); setResults([]) }}
          >
            CHAT PRIVADO
          </button>
          <button
            className="btn"
            style={tabStyle(mode === 'group')}
            onClick={() => { setMode('group'); setSelectedUsers([]); setResults([]) }}
          >
            CRIAR GRUPO
          </button>
        </div>

        <div className="scroll-area" style={{ padding: 'var(--sp-3)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
          {mode === 'group' && (
            <input
              className="field"
              placeholder="Nome do grupo"
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
            />
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 'var(--sp-2)' }}>
            <input
              className="field"
              placeholder="Buscar usuário pelo nome"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} disabled={loading} className="btn btn--primary">
              BUSCAR
            </button>
          </div>

          {mode === 'group' && selectedUsers.length > 0 && (
            <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--accent)', padding: '4px 8px', background: 'rgba(0, 255, 90, 0.1)' }}>
              {selectedUsers.length} participante(s) selecionado(s)
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
            {results.map(u => {
              const selected = mode === 'group' && !!selectedUsers.find(x => x._id === u._id)
              return (
                <div
                  key={u._id}
                  onClick={() => (mode === 'group' ? toggleUser(u) : startConversation(u))}
                  style={{
                    minHeight: 'var(--tap)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 'var(--sp-3)',
                    border: `1px solid ${selected ? 'var(--accent-strong)' : 'rgba(14, 143, 61, 0.6)'}`,
                    background: selected ? 'rgba(0, 255, 90, 0.1)' : 'rgba(3, 16, 11, 0.8)',
                    color: selected ? 'var(--accent)' : 'var(--text-main)',
                    cursor: 'pointer',
                    fontSize: 'var(--fs-sm)',
                  }}
                >
                  {selected && '[✓] '}
                  {'> '} {mode === 'group' ? 'add ' : 'connect --target='}{u.name}
                </div>
              )
            })}
          </div>

          {mode === 'group' && results.length > 0 && (
            <button
              onClick={createNewGroup}
              disabled={loading || selectedUsers.length < 2 || !groupName.trim()}
              className="btn btn--primary btn--block"
            >
              CRIAR GRUPO ({selectedUsers.length + 1} participantes)
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
