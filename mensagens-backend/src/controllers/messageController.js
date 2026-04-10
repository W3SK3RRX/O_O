import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import log from '../config/logger.js';

export const sendMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    // Usa dados validados ou originais
    const conversationId = req.validatedBody?.conversationId || req.body.conversationId;
    const cipherText = req.validatedBody?.cipherText || req.body.cipherText;
    const iv = req.validatedBody?.iv || req.body.iv;

    log.info({ conversationId, userId }, 'Enviando mensagem');

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      log.warn({ conversationId, userId }, 'Acesso negado à conversa');
      return res.status(403).json({ message: "Acesso negado à conversa" });
    }

    const message = await Message.create({
      conversationId,
      sender: userId,
      cipherText,
      iv,
      read: false,
    });

    conversation.lastMessage = message._id;
    await conversation.save();

    await message.populate('sender', 'name email avatar');

    log.info({ messageId: message._id }, 'Mensagem enviada com sucesso');
    return res.status(201).json(message);
  } catch (error) {
    log.error({ error }, 'Erro ao enviar mensagem');
    return res.status(500).json({ message: "Erro ao enviar mensagem" });
  }
};

export const getMessagesByConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    // Usa dados validados ou query original
    const page = req.validatedQuery?.page || req.query.page || 1;
    const limit = req.validatedQuery?.limit || req.query.limit || 20;
    const userId = req.user._id;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      log.warn({ conversationId, userId }, 'Acesso negado à conversa');
      return res.status(403).json({ message: "Acesso negado" });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await Message.find({ conversationId })
      .populate('sender', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Message.countDocuments({ conversationId });

    log.info({ conversationId, page, limit, total }, 'Mensagens buscadas');

    res.json({
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    log.error({ error }, 'Erro ao buscar mensagens');
    res.status(500).json({ message: "Erro ao buscar mensagens" });
  }
};
