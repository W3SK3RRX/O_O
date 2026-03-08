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
          <button
            style={styles.backButton}
            onClick={() => navigate(-1)}
            title="Voltar"
          >
            {'<'}
          </button>
          <div>
            <strong>NOVA CONVERSA</strong>
            <div style={styles.hint}>root@secure:~$ create_channel --encrypted</div>
          </div>
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
              BUSCAR
            </button>
          </div>

          {results.length === 0 && query && !loading && (
            <p style={styles.empty}>[!] nenhum usuário encontrado</p>
          )}

          <div style={styles.list}>
            {results.map(u => (
              <div
                key={u._id}
                style={styles.item}
                onClick={() => startConversation(u)}
              >
                {'> '} connect --target={u.name}
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
    padding: '16px 10px'
  },
  shell: {
    width: 'min(100%, 760px)',
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
  content: {
    padding: 14
  },
  search: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: 8,
    marginBottom: 16
  },
  input: {
    minWidth: 0,
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
  empty: {
    color: 'var(--text-muted)',
    fontSize: 13
  }
}
