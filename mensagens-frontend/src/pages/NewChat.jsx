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
import { encryptWithPublicKey } from '../crypto/envelope'
import { importPublicKey } from '../crypto/keys'
import { saveConversationKey } from '../crypto/conv-storage'
import { getPublicKey } from '../crypto/storage'

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
    const users = await searchUsers(query)
    setResults(users.filter(u => u._id !== user._id))
    setLoading(false)
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

      await saveConversationKeys(conversation._id, encryptedKeys, Date.now())
      await saveConversationKey(conversation._id, conversationKeyBase64, Date.now())

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

  return (
    <div style={styles.container}>
      <div style={styles.shell}>
        <div style={styles.header}>
          <button style={styles.backButton} onClick={() => navigate(-1)} title="Voltar">
            {'<'}
          </button>
          <div>
            <strong>NOVA CONVERSA</strong>
            <div style={styles.hint}>root@secure:~$ create_channel --encrypted</div>
          </div>
        </div>

        <div style={styles.modeToggle}>
          <button 
            style={mode === 'chat' ? styles.modeBtnActive : styles.modeBtn} 
            onClick={() => { setMode('chat'); setSelectedUsers([]); setResults([]) }}
          >
            CHAT PRIVADO
          </button>
          <button 
            style={mode === 'group' ? styles.modeBtnActive : styles.modeBtn} 
            onClick={() => { setMode('group'); setSelectedUsers([]); setResults([]) }}
          >
            CRIAR GRUPO
          </button>
        </div>

        <div style={styles.content}>
          {mode === 'group' && (
            <div style={styles.groupNameInput}>
              <input
                placeholder="Nome do grupo"
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                style={styles.input}
              />
            </div>
          )}

          <div style={styles.search}>
            <input
              placeholder="Buscar usuário pelo nome"
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={styles.input}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} disabled={loading} style={styles.button}>
              BUSCAR
            </button>
          </div>

          {mode === 'group' && selectedUsers.length > 0 && (
            <div style={styles.selectedInfo}>
              {selectedUsers.length} participante(s) selecionado(s)
            </div>
          )}

          <div style={styles.list}>
            {results.map(u => (
              <div
                key={u._id}
                style={mode === 'group' 
                  ? (selectedUsers.find(x => x._id === u._id) ? styles.itemSelected : styles.item)
                  : styles.item
                }
                onClick={() => mode === 'group' ? toggleUser(u) : startConversation(u)}
              >
                {mode === 'group' && selectedUsers.find(x => x._id === u._id) && '[✓] '}
                {'> '} {mode === 'group' ? 'add ' : 'connect --target='}{u.name}
              </div>
            ))}
          </div>

          {mode === 'group' && results.length > 0 && (
            <button 
              onClick={createNewGroup} 
              disabled={loading || selectedUsers.length < 2 || !groupName.trim()}
              style={styles.createGroupBtn}
            >
              CRIAR GRUPO ({selectedUsers.length + 1} participantes)
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100dvh',
    display: 'flex',
    justifyContent: 'center',
    padding: '16px 10px'
  },
  shell: {
    width: '100%',
    maxWidth: 760,
    border: '1px solid var(--border)',
    overflow: 'hidden',
    background: 'linear-gradient(180deg, rgba(2, 18, 13, 0.98), rgba(0, 9, 6, 0.98))',
    boxShadow: '0 0 18px rgba(0, 255, 90, 0.12), inset 0 0 20px rgba(0, 255, 90, 0.04)'
  },
  header: {
    padding: '12px 14px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    gap: 10
  },
  hint: {
    color: 'var(--text-muted)',
    fontSize: 12
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
  modeToggle: {
    display: 'flex',
    borderBottom: '1px solid var(--border)'
  },
  modeBtn: {
    flex: 1,
    padding: '10px',
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: 12
  },
  modeBtnActive: {
    flex: 1,
    padding: '10px',
    background: 'rgba(0, 255, 90, 0.1)',
    border: 'none',
    color: 'var(--accent)',
    cursor: 'pointer',
    fontSize: 12
  },
  content: {
    padding: 14,
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },
  groupNameInput: {
    marginBottom: 4
  },
  search: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: 8
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: 14,
    border: '1px solid var(--border)',
    outline: 'none',
    background: '#010805',
    color: 'var(--text-main)'
  },
  button: {
    padding: '0 14px',
    border: '1px solid var(--accent-strong)',
    background: 'rgba(0, 255, 90, 0.12)',
    color: 'var(--accent)',
    cursor: 'pointer',
    fontWeight: 700
  },
  selectedInfo: {
    fontSize: 12,
    color: 'var(--accent)',
    padding: '4px 8px',
    background: 'rgba(0, 255, 90, 0.1)'
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  item: {
    padding: '12px',
    border: '1px solid rgba(14, 143, 61, 0.6)',
    cursor: 'pointer',
    color: 'var(--text-main)',
    background: 'rgba(3, 16, 11, 0.8)'
  },
  itemSelected: {
    padding: '12px',
    border: '1px solid var(--accent-strong)',
    cursor: 'pointer',
    color: 'var(--accent)',
    background: 'rgba(0, 255, 90, 0.1)'
  },
  createGroupBtn: {
    padding: '12px',
    border: '1px solid var(--accent-strong)',
    background: 'rgba(0, 255, 90, 0.12)',
    color: 'var(--accent)',
    cursor: 'pointer',
    fontWeight: 700,
    marginTop: 8
  }
}