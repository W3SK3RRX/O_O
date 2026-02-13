import Conversation from '../models/Conversation.js';
import User from '../models/User.js';

export const createConversation = async (req, res) => {
  try {
    const { receiverId, participantId } = req.body;
    const senderId = req.user._id;
    const targetUserId = receiverId || participantId;

    if (!targetUserId) {
      return res.status(400).json({ message: 'receiverId é obrigatório' });
    }

    if (String(targetUserId) === String(senderId)) {
      return res.status(400).json({ message: 'Não é possível criar conversa com você mesmo' });
    }

    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ message: 'Usuário de destino não encontrado' });
    }

    // Verifica se já existe uma conversa entre esses dois usuários
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, targetUserId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, targetUserId],
      });
    }

    await conversation.populate('participants', 'name email avatar publicKey');

    res.status(200).json(conversation);
  } catch (error) {
    console.error("Erro createConversation:", error);
    res.status(500).json({ message: "Erro ao criar conversa" });
  }
};

export const getUserConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate('participants', 'name email avatar publicKey')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.status(200).json(conversations);
  } catch (error) {
    console.error("Erro getUserConversations:", error);
    res.status(500).json({ message: "Erro ao buscar conversas" });
  }
};

export const saveConversationKeys = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { encryptedKeys } = req.body;
    const userId = req.user._id;

    if (!encryptedKeys || typeof encryptedKeys !== 'object') {
      return res.status(400).json({ message: 'encryptedKeys é obrigatório' });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversa não encontrada' });
    }

    conversation.encryptedKeys = encryptedKeys;
    await conversation.save();

    return res.status(200).json({ message: 'Chaves da conversa salvas' });
  } catch (error) {
    console.error('Erro saveConversationKeys:', error);
    return res.status(500).json({ message: 'Erro ao salvar chaves da conversa' });
  }
};
