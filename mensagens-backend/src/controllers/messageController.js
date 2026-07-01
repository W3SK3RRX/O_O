import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import log from '../config/logger.js';

export const sendMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    // conversationId/cipherText/iv já validados pelo sendMessageSchema
    const { conversationId, cipherText, iv } = req.body;

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
    // page/limit já validados e coeridos para inteiros pelo paginationSchema
    const { page, limit } = req.validatedQuery;
    const userId = req.user._id;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      log.warn({ conversationId, userId }, 'Acesso negado à conversa');
      return res.status(403).json({ message: "Acesso negado" });
    }

    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversationId })
      .populate('sender', 'name email avatar')
      .populate({
        path: 'replyTo',
        select: 'cipherText iv deleted sender',
        populate: { path: 'sender', select: 'name' },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments({ conversationId });

    log.info({ conversationId, page, limit, total }, 'Mensagens buscadas');

    res.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    log.error({ error }, 'Erro ao buscar mensagens');
    res.status(500).json({ message: "Erro ao buscar mensagens" });
  }
};
