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
    origin: "*",
  },
});

/**
 * Middleware de autenticação do Socket.IO
 */
io.use(socketAuth);

/**
 * Conexões Socket.IO
 */
io.on("connection", (socket) => {
  console.log("Socket conectado:", socket.user.email);

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
    await Message.findByIdAndUpdate(messageId, { read: true });
  });

  socket.on("disconnect", () => {
    console.log("Socket desconectado:", socket.user.email);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
