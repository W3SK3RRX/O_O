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
      /**
       * 1️⃣ Cria a conversa no backend
       */
      const conversation = await createConversation(targetUser._id)

      /**
       * 2️⃣ Gera chave AES da conversa
       */
      const conversationKey = await generateConversationKey()
      const conversationKeyBase64 =
        await exportConversationKey(conversationKey)

      /**
       * 3️⃣ Criptografa a chave para cada participante
       */
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

      /**
       * 4️⃣ Envia as chaves criptografadas ao backend
       */
      await saveConversationKeys(
        conversation._id,
        encryptedKeys
      )

      /**
       * 5️⃣ Salva a chave da conversa localmente (para o usuário atual)
       */
      await saveConversationKey(
        conversation._id,
        conversationKeyBase64
      )

      /**
       * 6️⃣ Navega para o chat
       */
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
      <div style={styles.header}>
        <strong>Nova Conversa</strong>
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
              {u.name}
            </div>
          ))}
        </div>
      </div>
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
    background: '#000',
    color: '#fff'
  },
  header: {
    padding: '12px 16px',
    borderBottom: '1px solid #1f2933',
    background: '#0b0f1a'
  },
  content: {
    padding: 16
  },
  search: {
    display: 'flex',
    gap: 8,
    marginBottom: 16
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    fontSize: 16,
    borderRadius: 20,
    border: 'none',
    outline: 'none',
    background: '#1f2437',
    color: '#fff'
  },
  button: {
    padding: '0 16px',
    borderRadius: 20,
    border: 'none',
    background: '#2e7d32',
    color: '#fff',
    cursor: 'pointer'
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  item: {
    padding: '14px 12px',
    background: '#1f2437',
    borderRadius: 8,
    cursor: 'pointer'
  },
  empty: {
    opacity: 0.6,
    fontSize: 13
  }
}
