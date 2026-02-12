import User from '../models/User.js'; // Note o .js no final

export const searchUsers = async (req, res) => {
  try {
    const { search } = req.query;
    const currentUserId = req.user._id;

    if (!search) {
      return res.status(400).json({ message: 'Termo de busca é obrigatório' });
    }

    const users = await User.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ],
      _id: { $ne: currentUserId },
    }).select('name email avatar publicKey');

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar usuários', error: error.message });
  }
};

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar perfil' });
    }
};

export const updatePublicKey = async (req, res) => {
    try {
        const userId = req.user._id;
        const { publicKey } = req.body;

        if (!publicKey) {
            return res.status(400).json({ message: "Chave pública é obrigatória" });
        }

        await User.findByIdAndUpdate(userId, { publicKey });
        
        return res.status(200).json({ message: "Chave pública atualizada com sucesso" });
    } catch (error) {
        console.error("Erro updatePublicKey:", error);
        return res.status(500).json({ message: "Erro ao atualizar chave pública" });
    }
};

export const changePassword = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user._id;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: "A senha deve ter pelo menos 6 caracteres" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // O pre-save do Mongoose vai hashear a senha automaticamente
    user.password = password;
    await user.save();

    res.status(200).json({ message: "Senha alterada com sucesso" });
  } catch (error) {
    console.error("Erro changePassword:", error);
    res.status(500).json({ message: "Erro ao alterar senha" });
  }
};