// Resolve o nome exibido de uma conversa a partir dos participantes (exclui o
// usuário atual). Fonte única usada por ChatList e Chat.
export function getConversationName(conversation, currentUserId, fallback = 'CHAT_SESSION') {
  if (!conversation) return fallback
  if (conversation.isGroup && conversation.name) return conversation.name

  const candidates =
    conversation.participants || conversation.users || conversation.members || []

  const names = candidates
    .filter((p) => {
      const id = p?._id || p?.id || p
      return id && String(id) !== String(currentUserId)
    })
    .map((p) => p?.name || p?.username)
    .filter(Boolean)

  if (names.length > 0) return names.join(' • ')
  return conversation._id ? `Conversa #${String(conversation._id).slice(-4)}` : fallback
}
