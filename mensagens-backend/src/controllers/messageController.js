import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

export const sendMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    // FIX: Recebendo payload criptografado do Frontend
    const { conversationId, cipherText, iv } = req.body;

    if (!conversationId || !cipherText || !iv) {
      return res.status(400).json({
        message: "conversationId, cipherText e iv são obrigatórios"
      });
    }

    // Verificar se o usuário pertence à conversa
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(403).json({ message: "Acesso negado à conversa" });
    }

    // Criar mensagem com dados criptografados
    const message = await Message.create({
      conversationId,
      sender: userId,
      cipherText,
      iv,
      read: false,
    });

    // Atualizar última mensagem da conversa
    conversation.lastMessage = message._id;
    await conversation.save();

    // Popula dados do remetente para retorno
    await message.populate('sender', 'name email avatar');

    return res.status(201).json(message);
  } catch (error) {
    console.error("Erro sendMessage:", error);
    return res.status(500).json({ message: "Erro ao enviar mensagem" });
  }
};

// FIX: Renomeado de getMessages para getMessagesByConversation
export const getMessagesByConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Verificar acesso
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    const messages = await Message.find({ conversationId })
      .populate('sender', 'name email avatar')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error("Erro getMessages:", error);
    res.status(500).json({ message: "Erro ao buscar mensagens" });
  }
};