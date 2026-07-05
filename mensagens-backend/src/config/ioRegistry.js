import { onlineUsers } from '../store/onlineUsers.js';

// Guarda a instância do Socket.io para que código fora do server.js (ex.:
// controllers HTTP) possa agir sobre conexões — como derrubar todos os
// sockets de um usuário recém-desativado/com sessão revogada.
let ioRef = null;

export const setIo = (io) => { ioRef = io; };

export const disconnectUser = (userId) => {
  if (!ioRef) return;
  const entry = onlineUsers.get(userId.toString());
  if (!entry) return;
  for (const socketId of entry.sockets) {
    ioRef.sockets.sockets.get(socketId)?.disconnect(true);
  }
};
