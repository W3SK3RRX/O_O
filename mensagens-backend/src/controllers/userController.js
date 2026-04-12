import User from '../models/User.js';
import log from '../config/logger.js';

export const searchUsers = async (req, res) => {
  try {
    // Usa dados validados do middleware ou query original
    const search = req.validatedQuery?.search || req.query.search;
    const currentUserId = req.user._id;

    log.info({ search, userId: currentUserId }, 'Busca de usuários');

    const users = await User.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ],
      _id: { $ne: currentUserId },
    }).select('name email avatar publicKey');

    res.json(users);
  } catch (error) {
    log.error({ error }, 'Erro ao buscar usuários');
    res.status(500).json({ message: 'Erro ao buscar usuários' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    log.error({ error }, 'Erro ao buscar perfil');
    res.status(500).json({ message: 'Erro ao buscar perfil' });
  }
};

export const updatePublicKey = async (req, res) => {
  try {
    const userId = req.user._id;
    const { publicKey } = req.validatedBody || req.body;

    if (!publicKey) {
      return res.status(400).json({ message: "Chave pública é obrigatória" });
    }

    await User.findByIdAndUpdate(userId, { publicKey });
    
    log.info({ userId }, 'Chave pública atualizada');
    return res.status(200).json({ message: "Chave pública atualizada com sucesso" });
  } catch (error) {
    log.error({ error }, 'Erro ao atualizar chave pública');
    return res.status(500).json({ message: "Erro ao atualizar chave pública" });
  }
};

export const updateKeyPair = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      publicKey,
      privateKeyBackup,
    } = req.validatedBody || req.body;

    await User.findByIdAndUpdate(userId, {
      publicKey,
      privateKeyBackup,
    });

    log.info({ userId }, 'Par de chaves atualizado');
    return res.status(200).json({ message: "Par de chaves atualizado com sucesso" });
  } catch (error) {
    log.error({ error }, 'Erro ao atualizar par de chaves');
    return res.status(500).json({ message: "Erro ao atualizar par de chaves" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const password = req.validatedBody?.password || req.body.password;
    const userId = req.user._id;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: "A senha deve ter pelo menos 6 caracteres" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    user.password = password;
    await user.save();

    log.info({ userId }, 'Senha alterada com sucesso');
    res.status(200).json({ message: "Senha alterada com sucesso" });
  } catch (error) {
    log.error({ error }, 'Erro ao alterar senha');
    res.status(500).json({ message: "Erro ao alterar senha" });
  }
};