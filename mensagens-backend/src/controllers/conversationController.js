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
      participants: { $all: [senderId, targetUserId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, targetUserId],
      });
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
    const { name, participants } = req.body;
    const senderId = req.user._id;

    if (!name || !participants || !Array.isArray(participants)) {
      return res.status(400).json({ message: 'Nome e participantes são obrigatórios' });
    }

    if (participants.length < 2) {
      return res.status(400).json({ message: 'Grupo precisa de pelo menos 3 participantes' });
    }

    const uniqueParticipants = [...new Set([senderId, ...participants])];
    
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

    if (conversation.participants.includes(userId)) {
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
    const encryptedKeys = req.validatedBody?.encryptedKeys || req.body.encryptedKeys;
    const keyVersion = req.validatedBody?.keyVersion || req.body.keyVersion;
    const userId = req.user._id;

    if (!encryptedKeys || typeof encryptedKeys !== 'object') {
      return res.status(400).json({ message: 'encryptedKeys é obrigatório' });
    }

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
    // Usa dados validados ou query original
    const page = req.validatedQuery?.page || req.query.page || 1;
    const limit = req.validatedQuery?.limit || req.query.limit || 20;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate('participants', 'name email avatar publicKey')
      .populate('lastMessage')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Conversation.countDocuments({ participants: userId });

    log.info({ userId, page, limit, total }, 'Conversas buscadas');

    res.status(200).json({
      conversations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    log.error({ error }, 'Erro ao buscar conversas');
    res.status(500).json({ message: "Erro ao buscar conversas" });
  }
};
