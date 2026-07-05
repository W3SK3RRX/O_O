import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import app from './app.js';
import connectDatabase from './config/database.js';
import log from './config/logger.js';
import socketAuth from './config/socket.js';
import { setIo } from './config/ioRegistry.js';
import Message from './models/Message.js';
import Conversation from './models/Conversation.js';
import { onlineUsers, addUserSocket, removeUserSocket } from './store/onlineUsers.js';
import env from './config/env.js';
import { sendPushToUser } from './services/pushService.js';
import { createMessage } from './services/messageService.js';

const PORT = env.PORT;

process.on('unhandledRejection', (reason) => {
  log.error({ reason }, 'unhandledRejection');
});

process.on('uncaughtException', (err) => {
  log.fatal({ err }, 'uncaughtException');
  shutdown('uncaughtException');
});

await connectDatabase();

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean),
    credentials: true,
  },
});

setIo(io);

// Adapter Redis opcional para escala horizontal (>1 instância). Ativado só quando
// REDIS_URL está definido; sem ele, o app roda numa única instância (padrão atual).
if (env.REDIS_URL) {
  try {
    const [{ createAdapter }, { createClient }] = await Promise.all([
      import('@socket.io/redis-adapter'),
      import('redis'),
    ]);
    const pubClient = createClient({ url: env.REDIS_URL });
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    log.info('Socket.io usando adapter Redis');
  } catch (err) {
    log.error({ err }, 'Falha ao inicializar adapter Redis (instale @socket.io/redis-adapter e redis). Rodando sem adapter.');
  }
}

io.use(socketAuth);

// Wrapper: captura erros de handlers async (evita unhandledRejection) e, quando
// o cliente passa um callback de ack, devolve { ok, error } ao emissor.
const on = (socket, event, handler) => {
  socket.on(event, async (...args) => {
    const maybeAck = args[args.length - 1];
    const ack = typeof maybeAck === 'function' ? args.pop() : null;
    try {
      const result = await handler(...args);
      if (ack) ack({ ok: true, ...(result && typeof result === 'object' ? result : {}) });
    } catch (err) {
      log.error(
        { err, event, socketId: socket.id, userId: socket.user?._id },
        'Erro em handler de socket'
      );
      if (ack) ack({ ok: false, error: err.message || 'Erro ao processar' });
    }
  });
};

io.on('connection', (socket) => {
  log.info({ userId: socket.user._id }, 'Socket conectado');

  const becameOnline = addUserSocket(socket.user._id, socket.id, {
    email: socket.user.email,
    name: socket.user.name,
  });

  if (becameOnline) {
    io.emit('userOnline', {
      userId: socket.user._id,
      name: socket.user.name,
      email: socket.user.email,
    });
  }

  on(socket, 'joinConversation', async (conversationId) => {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: socket.user._id,
    }).select('_id');
    if (!conversation) return { joined: false };
    socket.join(conversationId);
    return { joined: true };
  });

  on(socket, 'leaveConversation', (conversationId) => {
    socket.leave(conversationId);
  });

  on(socket, 'sendMessage', async ({ conversationId, cipherText, iv, replyTo, attachments, clientId }) => {
    // Toda a lógica (autorização, anexos, replyTo, limites) vive no service,
    // compartilhada com a rota REST — fonte única de verdade.
    const { conversation, payload } = await createMessage({
      senderId: socket.user._id,
      senderName: socket.user.name,
      conversationId,
      cipherText,
      iv,
      replyTo,
      attachments,
      clientId,
    });

    io.to(conversationId).emit('newMessage', payload);
    // Garante entrega ao próprio remetente mesmo fora da sala (pós-reconexão).
    socket.emit('newMessage', payload);

    const offlineParticipants = conversation.participants.filter(
      (p) => p.toString() !== socket.user._id.toString() && !onlineUsers.has(p.toString())
    );
    for (const participantId of offlineParticipants) {
      sendPushToUser(participantId, {
        title: socket.user.name,
        body: 'Nova mensagem',
        conversationId,
      }).catch((err) => log.warn({ err }, 'Push notification failed'));
    }

    return { messageId: payload._id, clientId: clientId ?? null };
  });

  on(socket, 'readMessage', async (messageId) => {
    const message = await Message.findById(messageId);
    if (!message) return;

    const conversation = await Conversation.findOne({
      _id: message.conversationId,
      participants: socket.user._id,
    }).select('_id');
    if (!conversation) return;

    await Message.findByIdAndUpdate(messageId, { read: true });

    io.to(message.conversationId.toString()).emit('messageRead', {
      messageId,
      readBy: socket.user._id,
      readAt: new Date(),
    });
  });

  on(socket, 'markConversationRead', async (conversationId) => {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: socket.user._id,
    });
    if (!conversation) return;

    conversation.reads.set(socket.user._id.toString(), new Date());
    await conversation.save();

    await Message.updateMany(
      { conversationId, read: false, sender: { $ne: socket.user._id } },
      { $set: { read: true } }
    );

    io.to(conversationId).emit('conversationRead', {
      conversationId,
      readBy: socket.user._id,
      readAt: new Date(),
    });
  });

  on(socket, 'reactMessage', async ({ messageId, emoji }) => {
    if (!messageId || !emoji || typeof emoji !== 'string' || emoji.length > 16) return;

    const message = await Message.findById(messageId);
    if (!message) return;

    const conversation = await Conversation.findOne({
      _id: message.conversationId,
      participants: socket.user._id,
    }).select('_id');
    if (!conversation) return;

    const uid = socket.user._id.toString();
    const idx = message.reactions.findIndex((r) => r.user.toString() === uid && r.emoji === emoji);

    if (idx >= 0) {
      message.reactions.splice(idx, 1);
    } else {
      message.reactions.push({ user: socket.user._id, emoji });
    }
    await message.save();

    io.to(message.conversationId.toString()).emit('messageReaction', {
      messageId,
      reactions: message.reactions,
    });
  });

  on(socket, 'typing', ({ conversationId, isTyping }) => {
    socket.to(conversationId).emit('userTyping', {
      conversationId,
      userId: socket.user._id,
      name: socket.user.name,
      isTyping,
    });
  });

  on(socket, 'deleteMessage', async (messageId) => {
    const message = await Message.findById(messageId);
    if (!message) return;
    if (message.sender.toString() !== socket.user._id.toString()) return;

    await Message.findByIdAndUpdate(messageId, {
      deleted: true,
      cipherText: '[mensagem apagada]',
      iv: '',
    });

    io.to(message.conversationId.toString()).emit('messageDeleted', { messageId });
  });

  on(socket, 'editMessage', async ({ messageId, cipherText, iv }) => {
    if (!cipherText || !iv) return;
    const message = await Message.findById(messageId);
    if (!message) return;
    if (message.sender.toString() !== socket.user._id.toString()) return;
    if (message.deleted) return;

    await Message.findByIdAndUpdate(messageId, { edited: true, cipherText, iv });

    io.to(message.conversationId.toString()).emit('messageEdited', {
      messageId,
      cipherText,
      iv,
      editedAt: new Date(),
    });
  });

  socket.on('disconnect', () => {
    log.info({ userId: socket.user._id }, 'Socket desconectado');
    const becameOffline = removeUserSocket(socket.user._id, socket.id);
    if (becameOffline) {
      io.emit('userOffline', { userId: socket.user._id, lastSeen: new Date() });
    }
  });
});

const server = httpServer.listen(PORT, () => {
  log.info({ port: PORT }, 'Servidor iniciado');
});

// Graceful shutdown
let shuttingDown = false;
const shutdown = async (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;

  log.info({ signal }, 'Encerrando gracefully...');

  io.close();

  server.close(async () => {
    await mongoose.connection.close();
    log.info('Conexões encerradas. Processo finalizado.');
    process.exit(0);
  });
  setTimeout(() => {
    log.error('Timeout de shutdown — forçando encerramento');
    process.exit(1);
  }, 10_000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
