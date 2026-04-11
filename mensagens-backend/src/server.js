import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import app from "./app.js";
import connectDatabase from "./config/database.js";
import socketAuth from "./config/socket.js";
import Message from "./models/Message.js";
import Conversation from "./models/Conversation.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

await connectDatabase();

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['https://o_o.infinyforge.com.br'],
    credentials: true
  },
});

// Mapa de usuários online: userId -> { socketId, email, name, lastSeen }
export const onlineUsers = new Map();

io.use(socketAuth);

/**
 * Conexões Socket.IO
 */
io.on("connection", (socket) => {
  console.log("Socket conectado:", socket.user.email);

  // Adiciona usuário à lista de online
  onlineUsers.set(socket.user._id.toString(), {
    socketId: socket.id,
    userId: socket.user._id,
    email: socket.user.email,
    name: socket.user.name,
    lastSeen: new Date(),
    connectedAt: new Date()
  });

  // Notifica admin sobre novo usuário online
  io.emit("userOnline", {
    userId: socket.user._id,
    name: socket.user.name,
    email: socket.user.email
  });

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
      await conversation.save();

      /**
       * 🔐 Emite payload criptografado
       */
      io.to(conversationId).emit("newMessage", {
        _id: message._id,
        conversationId,
        senderId: socket.user._id,
        cipherText,
        iv,
        createdAt: message.createdAt,
      });

    } catch (err) {
      console.error("Erro ao enviar mensagem", err);
    }
  });


  /**
   * Confirma leitura
   */
  socket.on("readMessage", async (messageId) => {
    const message = await Message.findById(messageId);
    if (!message) return;
    
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
    console.log("Socket desconectado:", socket.user.email);
    
    const userId = socket.user._id.toString();
    const userData = onlineUsers.get(userId);

    // Remove apenas se o socket desconectado for o socket ativo do usuário
    // (evita remover conexão nova em casos de reconexão rápida/múltiplas abas)
    if (userData?.socketId === socket.id) {
      onlineUsers.delete(userId);

      // Notifica admin sobre usuário offline
      io.emit("userOffline", {
        userId: socket.user._id,
        lastSeen: new Date()
      });
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
