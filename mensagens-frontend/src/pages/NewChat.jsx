import { useState } from 'react'
import { searchUsers } from '../api/user.api'
import {
  createConversation,
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
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const user = useAuthStore(state => state.user)

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    const users = await searchUsers(query)
    setResults(users)
    setLoading(false)
  }

  const startConversation = async targetUser => {
    setLoading(true)

    try {
      if (!targetUser.publicKey) {
        alert('Este usuário ainda não inicializou a criptografia. Peça para ele fazer login primeiro.')
        return
      }
      const conversation = await createConversation(targetUser._id)

      const conversationKey = await generateConversationKey()
      const conversationKeyBase64 =
        await exportConversationKey(conversationKey)

      const encryptedKeys = {}

      const localPublicKey = await getPublicKey()
      const participants = [
        { ...user, publicKey: user.publicKey || localPublicKey },
        targetUser,
      ]

      for (const participant of participants) {
        if (!participant.publicKey) {
          throw new Error(
            `Usuário ${participant.name} não possui publicKey`
          )
        }

        const publicKey = await importPublicKey(participant.publicKey)

        encryptedKeys[participant._id] =
          await encryptWithPublicKey(
            publicKey,
            conversationKeyBase64
          )
      }

      await saveConversationKeys(
        conversation._id,
        encryptedKeys
      )

      await saveConversationKey(
        conversation._id,
        conversationKeyBase64
      )

      navigate(`/chat/${conversation._id}`)
    } catch (err) {
      console.error('Erro ao iniciar conversa segura', err)
      alert('Erro ao iniciar conversa')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.shell}>
        <div style={styles.header}>
          <strong>Nova Conversa</strong>
          <span style={styles.hint}>new-chat --secure</span>
        </div>

        <div style={styles.content}>
          <div style={styles.search}>
            <input
              placeholder="Buscar usuário pelo nome"
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={styles.input}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              style={styles.button}
            >
              Buscar
            </button>
          </div>

          {results.length === 0 && query && !loading && (
            <p style={styles.empty}>Nenhum usuário encontrado</p>
          )}

          <div style={styles.list}>
            {results.map(u => (
              <div
                key={u._id}
                style={styles.item}
                onClick={() => startConversation(u)}
              >
                {'>_ '} {u.name}
              </div>
            ))}
          </div>
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
    padding: '18px 10px'
  },
  shell: {
    width: 'min(100%, 720px)',
    borderRadius: 14,
    border: '1px solid var(--border)',
    overflow: 'hidden',
    background: 'linear-gradient(180deg, rgba(17, 28, 45, 0.96), rgba(8, 13, 22, 0.97))'
  },
  header: {
    padding: '14px 16px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap'
  },
  hint: {
    color: 'var(--accent)',
    fontSize: 12
  },
  content: {
    padding: 16
  },
  search: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: 8,
    marginBottom: 16
  },
  input: {
    minWidth: 0,
    padding: '11px 12px',
    fontSize: 14,
    borderRadius: 10,
    border: '1px solid var(--border)',
    outline: 'none',
    background: 'var(--bg-main)',
    color: 'var(--text-main)'
  },
  button: {
    padding: '0 16px',
    borderRadius: 10,
    border: '1px solid var(--accent-strong)',
    background: 'linear-gradient(180deg, #4dd89b 0%, #2ca171 100%)',
    color: '#06281d',
    cursor: 'pointer',
    fontWeight: 700
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  item: {
    padding: '12px 12px',
    background: 'rgba(16, 25, 40, 0.7)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    cursor: 'pointer',
    color: 'var(--text-main)'
  },
  empty: {
    color: 'var(--text-muted)',
    fontSize: 13
  }
}
