import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import app from './app.js';
import connectDatabase from './config/database.js';
import log from './config/logger.js';
import socketAuth from './config/socket.js';
import Message from './models/Message.js';
import Conversation from './models/Conversation.js';
import { onlineUsers, addUserSocket, removeUserSocket } from './store/onlineUsers.js';
import env from './config/env.js';
import { sendPushToUser } from './services/pushService.js';

const PORT = env.PORT;

// Erros não capturados
process.on('unhandledRejection', (reason) => {
  log.error({ reason }, 'unhandledRejection');
});

process.on('uncaughtException', (err) => {
  log.fatal({ err }, 'uncaughtException');
  // Encerra gracefully (fecha sockets/HTTP/Mongo) em vez de matar abruptamente
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

io.use(socketAuth);

/**
 * Conexões Socket.IO
 */
io.on("connection", (socket) => {
  log.info({ email: socket.user.email }, 'Socket conectado');

  // Adiciona conexão à lista de online (suporta múltiplas abas/dispositivos)
  const becameOnline = addUserSocket(socket.user._id, socket.id, {
    email: socket.user.email,
    name: socket.user.name,
  });

  // Notifica admin apenas quando o usuário fica online (primeira conexão)
  if (becameOnline) {
    io.emit("userOnline", {
      userId: socket.user._id,
      name: socket.user.name,
      email: socket.user.email
    });
  }

  /**
   * Entrar em uma conversa (room)
   */
  socket.on("joinConversation", async (conversationId) => {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: socket.user._id,
    });

    if (!conversation) return;

    socket.join(conversationId);
  });

  /**
   * Sair de uma conversa (room)
   */
  socket.on("leaveConversation", (conversationId) => {
    socket.leave(conversationId);
  });

  /**
   * Enviar mensagem em tempo real
   */
  socket.on("sendMessage", async ({ conversationId, cipherText, iv }) => {
    try {
      if (!conversationId || !cipherText || !iv) return;

      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: socket.user._id,
      });

      if (!conversation) return;

      const message = await Message.create({
        conversationId,
        sender: socket.user._id,
        cipherText,
        iv,
        read: false,
      });

      conversation.lastMessage = message._id;
      // Quem envia já leu o histórico anterior — evita a própria mensagem
      // (e as anteriores) contarem como não lidas para o remetente.
      conversation.reads.set(socket.user._id.toString(), new Date());
      await conversation.save();

      /**
       * 🔐 Emite payload criptografado
       */
      const payload = {
        _id: message._id,
        conversationId,
        senderId: socket.user._id,
        senderName: socket.user.name,
        cipherText,
        iv,
        createdAt: message.createdAt,
      };

      // Emite para a sala (demais participantes que estão com a conversa aberta).
      io.to(conversationId).emit("newMessage", payload);

      // Garante a entrega ao próprio remetente mesmo que ele não esteja na sala
      // (ex.: logo após uma reconexão, antes do re-join). O cliente deduplica
      // por _id, então não há risco de duplicar a bolha.
      socket.emit("newMessage", payload);

      // Notify offline participants via Web Push
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

    } catch (err) {
      log.error({ err }, 'Erro ao enviar mensagem via socket');
    }
  });


  /**
   * Confirma leitura
   */
  socket.on("readMessage", async (messageId) => {
    const message = await Message.findById(messageId);
    if (!message) return;

    // Autorização: o usuário precisa participar da conversa da mensagem
    const conversation = await Conversation.findOne({
      _id: message.conversationId,
      participants: socket.user._id,
    });
    if (!conversation) return;

    await Message.findByIdAndUpdate(messageId, { read: true });

    // Notifica quem enviou que a mensagem foi lida
    io.to(message.conversationId.toString()).emit("messageRead", {
      messageId,
      readBy: socket.user._id,
      readAt: new Date()
    });
  });

  /**
   * Marcar todas mensagens de uma conversa como lidas
   */
  socket.on("markConversationRead", async (conversationId) => {
    // Autorização: o usuário precisa participar da conversa
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: socket.user._id,
    });
    if (!conversation) return;

    // Persiste a última leitura (fonte de verdade das não lidas, sobrevive a reload).
    conversation.reads.set(socket.user._id.toString(), new Date());
    await conversation.save();

    await Message.updateMany(
      { conversationId, read: false, sender: { $ne: socket.user._id } },
      { $set: { read: true } }
    );

    io.to(conversationId).emit("conversationRead", {
      conversationId,
      readBy: socket.user._id,
      readAt: new Date()
    });
  });

  /**
   * Indicador de digitação
   */
  socket.on("typing", ({ conversationId, isTyping }) => {
    socket.to(conversationId).emit("userTyping", {
      conversationId,
      userId: socket.user._id,
      name: socket.user.name,
      isTyping
    });
  });

  /**
   * Apagar mensagem (delete lógico)
   */
  socket.on("deleteMessage", async (messageId) => {
    const message = await Message.findById(messageId);
    if (!message) return;
    
    // Apenas quem enviou pode deletar
    if (message.sender.toString() !== socket.user._id.toString()) return;
    
    await Message.findByIdAndUpdate(messageId, { 
      deleted: true,
      cipherText: '[mensagem apagada]',
      iv: ''
    });
    
    io.to(message.conversationId.toString()).emit("messageDeleted", {
      messageId
    });
  });

  /**
   * Editar mensagem
   */
  socket.on("editMessage", async ({ messageId, cipherText, iv }) => {
    const message = await Message.findById(messageId);
    if (!message) return;
    
    // Apenas quem enviou pode editar
    if (message.sender.toString() !== socket.user._id.toString()) return;

    // Não permite editar mensagem já apagada (ressuscitaria conteúdo)
    if (message.deleted) return;

    await Message.findByIdAndUpdate(messageId, {
      edited: true,
      cipherText,
      iv
    });
    
    io.to(message.conversationId.toString()).emit("messageEdited", {
      messageId,
      cipherText,
      iv,
      editedAt: new Date()
    });
  });

  socket.on("disconnect", () => {
    log.info({ email: socket.user.email }, 'Socket desconectado');

    // Remove apenas esta conexão; só fica offline quando não há mais sockets
    const becameOffline = removeUserSocket(socket.user._id, socket.id);

    if (becameOffline) {
      io.emit("userOffline", {
        userId: socket.user._id,
        lastSeen: new Date()
      });
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

  // Fecha os WebSockets primeiro; senão server.close() nunca chama o callback
  // (conexões Socket.io de longa duração mantêm o servidor vivo).
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