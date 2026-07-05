import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import log from '../config/logger.js';
import { ForbiddenError, AppError } from '../middlewares/errorClasses.js';
import { createMessage } from '../services/messageService.js';

export const sendMessage = async (req, res) => {
  const userId = req.user._id;
  const { conversationId, cipherText, iv, replyTo, attachments, clientId } = req.body;

  try {
    const { payload } = await createMessage({
      senderId: userId,
      senderName: req.user.name,
      conversationId,
      cipherText,
      iv,
      replyTo,
      attachments,
      clientId,
    });
    log.info({ messageId: payload._id }, 'Mensagem enviada (REST)');
    return res.status(201).json(payload);
  } catch (err) {
    if (err.code === 'PAYLOAD_TOO_LARGE') throw new AppError(err.message, 413, 'PAYLOAD_TOO_LARGE');
    if (err.code === 'INVALID_PAYLOAD') throw new AppError(err.message, 400, 'INVALID_PAYLOAD');
    throw err;
  }
};

export const getMessagesByConversation = async (req, res) => {
  const { conversationId } = req.params;
  // page/limit já validados e coeridos para inteiros pelo paginationSchema
  const { page, limit } = req.validatedQuery;
  const userId = req.user._id;

  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  }).select('_id');

  if (!conversation) {
    log.warn({ conversationId, userId, requestId: req.requestId }, 'Acesso negado à conversa');
    throw new ForbiddenError('Acesso negado');
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
    .limit(limit)
    .lean(); // resposta read-only: dispensa hidratação de documentos Mongoose

  // O count só é necessário na 1ª página (o cliente guarda a paginação).
  const total = page === 1 ? await Message.countDocuments({ conversationId }) : undefined;

  res.json({
    messages,
    pagination: {
      page,
      limit,
      ...(total !== undefined && { total, pages: Math.ceil(total / limit) }),
    },
  });
};
