import Conversation from '../models/Conversation.js';
import User from '../models/User.js';
import log from '../config/logger.js';

export const createConversation = async (req, res) => {
  try {
    const targetUserId = req.validatedBody?.receiverId || req.body.receiverId || req.body.participantId;
    const senderId = req.user._id;

    if (!targetUserId) {
      return res.status(400).json({ message: 'receiverId é obrigatório' });
    }

    if (String(targetUserId) === String(senderId)) {
      return res.status(400).json({ message: 'Não é possível criar conversa com você mesmo' });
    }

    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      log.warn({ targetUserId }, 'Usuário de destino não encontrado');
      return res.status(404).json({ message: 'Usuário de destino não encontrado' });
    }

    let conversation = await Conversation.findOne({
      isGroup: false,
      participants: { $all: [senderId, targetUserId], $size: 2 },
    });

    if (!conversation) {
      try {
        conversation = await Conversation.create({
          participants: [senderId, targetUserId],
        });
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

    log.info({ conversationId: conversation._id }, 'Conversa criada/encontrada');
    res.status(200).json(conversation);
  } catch (error) {
    log.error({ error }, 'Erro ao criar conversa');
    res.status(500).json({ message: "Erro ao criar conversa" });
  }
};

export const createGroup = async (req, res) => {
  try {
    // name e participants já validados pelo schema (createGroupSchema)
    const { name, participants } = req.body;
    const senderId = req.user._id;

    // Garante que todos os participantes informados existem
    const foundUsers = await User.find({ _id: { $in: participants } }).select('_id');
    if (foundUsers.length !== new Set(participants).size) {
      return res.status(400).json({ message: 'Um ou mais participantes não existem' });
    }

    const uniqueParticipants = [...new Set([senderId.toString(), ...participants])];

    const group = await Conversation.create({
      name,
      participants: uniqueParticipants,
      isGroup: true,
      createdBy: senderId
    });

    await group.populate('participants', 'name email avatar publicKey');

    log.info({ groupId: group._id, name }, 'Grupo criado');
    res.status(201).json(group);
  } catch (error) {
    log.error({ error }, 'Erro ao criar grupo');
    res.status(500).json({ message: "Erro ao criar grupo" });
  }
};

export const addParticipant = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;
    const adminId = req.user._id;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversa não encontrada' });
    }

    if (!conversation.isGroup) {
      return res.status(400).json({ message: 'Não é possível adicionar participantes em conversa privada' });
    }

    if (String(conversation.createdBy) !== String(adminId)) {
      return res.status(403).json({ message: 'Apenas o criador pode adicionar participantes' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    if (conversation.participants.some((p) => String(p) === String(userId))) {
      return res.status(400).json({ message: 'Usuário já é participante' });
    }

    conversation.participants.push(userId);
    await conversation.save();

    await conversation.populate('participants', 'name email avatar publicKey');

    log.info({ conversationId, userId }, 'Participante adicionado');
    res.status(200).json(conversation);
  } catch (error) {
    log.error({ error }, 'Erro ao adicionar participante');
    res.status(500).json({ message: "Erro ao adicionar participante" });
  }
};

export const removeParticipant = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;
    const adminId = req.user._id;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversa não encontrada' });
    }

    if (!conversation.isGroup) {
      return res.status(400).json({ message: 'Não é possível remover participantes de conversa privada' });
    }

    if (String(conversation.createdBy) !== String(adminId)) {
      return res.status(403).json({ message: 'Apenas o criador pode remover participantes' });
    }

    conversation.participants = conversation.participants.filter(
      p => String(p) !== String(userId)
    );
    await conversation.save();

    await conversation.populate('participants', 'name email avatar publicKey');

    log.info({ conversationId, userId }, 'Participante removido');
    res.status(200).json(conversation);
  } catch (error) {
    log.error({ error }, 'Erro ao remover participante');
    res.status(500).json({ message: "Erro ao remover participante" });
  }
};

export const saveConversationKeys = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { encryptedKeys, keyVersion } = req.body;
    const userId = req.user._id;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      log.warn({ conversationId, userId }, 'Conversa não encontrada');
      return res.status(404).json({ message: 'Conversa não encontrada' });
    }

    conversation.encryptedKeys = encryptedKeys;
    
    // Atualiza a versão da chave se fornecida
    if (keyVersion !== undefined) {
      conversation.keyVersion = keyVersion;
    }
    
    await conversation.save();

    log.info({ conversationId, keyVersion }, 'Chaves da conversa salvas');
    return res.status(200).json({ message: 'Chaves da conversa salvas' });
  } catch (error) {
    log.error({ error }, 'Erro ao salvar chaves da conversa');
    return res.status(500).json({ message: 'Erro ao salvar chaves da conversa' });
  }
};

export const getUserConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    // page/limit já validados e coeridos para inteiros pelo paginationSchema
    const { page, limit } = req.validatedQuery;

    const skip = (page - 1) * limit;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate('participants', 'name email avatar publicKey')
      .populate('lastMessage')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Conversation.countDocuments({ participants: userId });

    log.info({ userId, page, limit, total }, 'Conversas buscadas');

    res.status(200).json({
      conversations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    log.error({ error }, 'Erro ao buscar conversas');
    res.status(500).json({ message: "Erro ao buscar conversas" });
  }
};
