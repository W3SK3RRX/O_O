// Mapa de usuários online: userId -> { userId, email, name, lastSeen, connectedAt, sockets: Set<socketId> }
// Suporta múltiplas conexões simultâneas (abas/dispositivos) por usuário.
export const onlineUsers = new Map();

/**
 * Registra uma conexão de socket para um usuário.
 * Cria a entrada se for a primeira conexão.
 * @returns {boolean} true se este é o primeiro socket do usuário (ficou online agora)
 */
export function addUserSocket(userId, socketId, info = {}) {
  const id = userId.toString();
  const existing = onlineUsers.get(id);

  if (existing) {
    existing.sockets.add(socketId);
    existing.lastSeen = new Date();
    return false;
  }

  onlineUsers.set(id, {
    userId,
    email: info.email,
    name: info.name,
    connectedAt: new Date(),
    lastSeen: new Date(),
    sockets: new Set([socketId]),
  });
  return true;
}

/**
 * Remove uma conexão de socket de um usuário.
 * Só remove a entrada (fica offline) quando não restam sockets.
 * @returns {boolean} true se o usuário ficou offline (sem sockets restantes)
 */
export function removeUserSocket(userId, socketId) {
  const id = userId.toString();
  const entry = onlineUsers.get(id);

  if (!entry) return false;

  entry.sockets.delete(socketId);

  if (entry.sockets.size === 0) {
    onlineUsers.delete(id);
    return true;
  }

  entry.lastSeen = new Date();
  return false;
}
