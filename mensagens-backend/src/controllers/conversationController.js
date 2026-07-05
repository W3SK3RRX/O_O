import Conversation from '../models/Conversation.js';
import User from '../models/User.js';
import log from '../config/logger.js';
import { NotFoundError, ForbiddenError, ValidationError, ConflictError } from '../middlewares/errorClasses.js';
import { attachUnreadCounts } from '../services/conversationService.js';

export const createConversation = async (req, res) => {
  const targetUserId = req.validatedBody?.receiverId || req.body.receiverId || req.body.participantId;
  const senderId = req.user._id;

  if (!targetUserId) {
    throw new ValidationError('receiverId é obrigatório');
  }

  if (String(targetUserId) === String(senderId)) {
    throw new ValidationError('Não é possível criar conversa com você mesmo');
  }

  const targetUser = await User.findById(targetUserId).select('_id');
  if (!targetUser) {
    throw new NotFoundError('Usuário de destino');
  }

  let conversation = await Conversation.findOne({
    isGroup: false,
    participants: { $all: [senderId, targetUserId], $size: 2 },
  });

  let created = false;
  if (!conversation) {
    try {
      conversation = await Conversation.create({ participants: [senderId, targetUserId] });
      created = true;
    } catch (err) {
      // Race: outra requisição criou a mesma conversa 1-a-1 (índice único)
      if (err.code === 11000) {
        conversation = await Conversation.findOne({
          isGroup: false,
          participants: { $all: [senderId, targetUserId], $size: 2 },
        });
      } else {
        throw err;
      }
    }
  }

  await conversation.populate('participants', 'name email avatar publicKey');

  log.info({ conversationId: conversation._id, created }, 'Conversa criada/encontrada');
  res.status(created ? 201 : 200).json(conversation);
};

export const createGroup = async (req, res) => {
  const { name, participants } = req.body;
  const senderId = req.user._id;

  const foundUsers = await User.find({ _id: { $in: participants } }).select('_id');
  if (foundUsers.length !== new Set(participants).size) {
    throw new ValidationError('Um ou mais participantes não existem');
  }

  const uniqueParticipants = [...new Set([senderId.toString(), ...participants])];

  const group = await Conversation.create({
    name,
    participants: uniqueParticipants,
    isGroup: true,
    createdBy: senderId,
  });

  await group.populate('participants', 'name email avatar publicKey');

  log.info({ groupId: group._id }, 'Grupo criado');
  res.status(201).json(group);
};

export const addParticipant = async (req, res) => {
  const { conversationId } = req.params;
  const { userId } = req.body;
  const adminId = req.user._id;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new NotFoundError('Conversa');

  if (!conversation.isGroup) {
    throw new ValidationError('Não é possível adicionar participantes em conversa privada');
  }
  if (String(conversation.createdBy) !== String(adminId)) {
    throw new ForbiddenError('Apenas o criador pode adicionar participantes');
  }

  const targetUser = await User.findById(userId).select('_id');
  if (!targetUser) throw new NotFoundError('Usuário');

  if (conversation.participants.some((p) => String(p) === String(userId))) {
    throw new ConflictError('Usuário já é participante');
  }

  conversation.participants.push(userId);
  await conversation.save();
  await conversation.populate('participants', 'name email avatar publicKey');

  log.info({ conversationId, userId }, 'Participante adicionado');
  res.status(200).json(conversation);
};

export const removeParticipant = async (req, res) => {
  const { conversationId } = req.params;
  const { userId } = req.body;
  const adminId = req.user._id;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new NotFoundError('Conversa');

  if (!conversation.isGroup) {
    throw new ValidationError('Não é possível remover participantes de conversa privada');
  }
  if (String(conversation.createdBy) !== String(adminId)) {
    throw new ForbiddenError('Apenas o criador pode remover participantes');
  }

  conversation.participants = conversation.participants.filter((p) => String(p) !== String(userId));
  await conversation.save();
  await conversation.populate('participants', 'name email avatar publicKey');

  log.info({ conversationId, userId }, 'Participante removido');
  res.status(200).json(conversation);
};

export const saveConversationKeys = async (req, res) => {
  const { conversationId } = req.params;
  const { encryptedKeys, keyVersion } = req.body;
  const userId = req.user._id;

  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  });

  if (!conversation) throw new NotFoundError('Conversa');

  const currentVersion = conversation.keyVersion ?? 0;
  const newVersion = keyVersion ?? currentVersion;

  // Anti-downgrade: não aceita versão de chave anterior à atual.
  if (newVersion < currentVersion) {
    throw new ValidationError('Versão de chave desatualizada');
  }

  if (newVersion > currentVersion) {
    // Rotação de chave: substitui o mapa inteiro (nova versão para todos).
    conversation.encryptedKeys = encryptedKeys;
    conversation.keyVersion = newVersion;
  } else {
    // Mesma versão: MERGE — permite adicionar/atualizar entradas sem apagar as
    // dos demais membros (impede que um participante zere o acesso alheio).
    for (const [uid, key] of Object.entries(encryptedKeys)) {
      conversation.encryptedKeys.set(uid, key);
    }
  }

  await conversation.save();

  log.info({ conversationId, keyVersion: conversation.keyVersion }, 'Chaves da conversa salvas');
  res.status(200).json({ message: 'Chaves da conversa salvas' });
};

export const getConversationById = async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user._id;

  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  })
    .populate('participants', 'name email avatar publicKey')
    .populate('lastMessage')
    .lean();

  if (!conversation) throw new NotFoundError('Conversa');

  await attachUnreadCounts([conversation], userId);

  res.status(200).json(conversation);
};

export const getUserConversations = async (req, res) => {
  const userId = req.user._id;
  const { page, limit } = req.validatedQuery;
  const skip = (page - 1) * limit;

  const conversations = await Conversation.find({ participants: userId })
    .populate('participants', 'name email avatar publicKey')
    .populate('lastMessage')
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = page === 1 ? await Conversation.countDocuments({ participants: userId }) : undefined;

  await attachUnreadCounts(conversations, userId);

  res.status(200).json({
    conversations,
    pagination: {
      page,
      limit,
      ...(total !== undefined && { total, pages: Math.ceil(total / limit) }),
    },
  });
};

export const markConversationRead = async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user._id;

  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  });

  if (!conversation) throw new NotFoundError('Conversa');

  conversation.reads.set(userId.toString(), new Date());
  await conversation.save();

  log.info({ conversationId, userId }, 'Conversa marcada como lida');
  res.status(200).json({ unreadCount: 0 });
};
