import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";

export default function registerSocket(io) {
  io.on("connection", (socket) => {
    console.log("Socket conectado:", socket.user.email);

    /**
     * 🔌 Entrar em uma conversa (room)
     * Garante que o usuário participa da conversa
     */
    socket.on("joinConversation", async (conversationId) => {
      try {
        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: socket.user._id,
        });

        if (!conversation) return;

        socket.join(conversationId);
      } catch (err) {
        console.error("Erro ao entrar na conversa", err);
      }
    });

    /**
     * ✉️ Enviar mensagem criptografada (E2EE)
     */
    socket.on("sendMessage", async ({ conversationId, cipherText, iv }) => {
      try {
        const userId = socket.user._id;

        if (!conversationId || !cipherText || !iv) return;

        /**
         * 🔐 Garante que o usuário participa da conversa
         */
        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: userId,
        });

        if (!conversation) return;

        const message = await Message.create({
          conversationId,
          senderId: userId,
          cipherText,
          iv,
          delivered: true,
        });

        conversation.lastMessage = message._id;
        await conversation.save();

        /**
         * 📡 Emite payload criptografado
         * Backend não interpreta conteúdo
         */
        io.to(conversationId).emit("newMessage", {
          _id: message._id,
          conversationId,
          senderId: userId,
          cipherText,
          iv,
          createdAt: message.createdAt,
        });

      } catch (err) {
        console.error("Erro ao enviar mensagem", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket desconectado:", socket.user.email);
    });
  });
}
