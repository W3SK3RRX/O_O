import Conversation from '../models/Conversation.js';
import User from '../models/User.js';

export const createConversation = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user._id;

    // Verifica se já existe uma conversa entre esses dois usuários
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
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