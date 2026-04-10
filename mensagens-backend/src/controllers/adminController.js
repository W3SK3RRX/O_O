import User from '../models/User.js';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import bcrypt from 'bcryptjs';
import { onlineUsers } from '../server.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ active: true });
    const totalMessages = await Message.countDocuments();
    const totalConversations = await Conversation.countDocuments();

    res.json({
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      totalMessages,
      totalConversations,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar estatísticas do dashboard' });
  }
};

export const getOnlineUsers = async (req, res) => {
  try {
    const users = Array.from(onlineUsers.values()).map(user => ({
      userId: user.userId,
      name: user.name,
      email: user.email,
      connectedAt: user.connectedAt,
      lastSeen: user.lastSeen
    }));
    
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar usuários online' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar usuários' });
  }
};

export const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'Usuário já existe' });
        }

        const isAdmin = role === 'admin';

        const user = await User.create({
            name,
            email,
            password,
            role,
            isAdmin,
            active: true
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isAdmin: user.isAdmin,
                active: user.active,
            });
        } else {
            res.status(400).json({ message: 'Dados de usuário inválidos' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar usuário', error: error.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { name, role, active } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        if (name) user.name = name;
        if (role) {
            user.role = role;
            user.isAdmin = role === 'admin';
        }
        if (typeof active === 'boolean') user.active = active;

        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isAdmin: user.isAdmin,
            active: user.active,
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar usuário' });
    }
};

export const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        user.active = req.body.active;
        await user.save();

        res.json({ message: `Usuário ${user.active ? 'ativado' : 'desativado'}` });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao alterar status do usuário' });
    }
};

export const resetUserPassword = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        const newPassword = Math.random().toString(36).slice(-8);
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Senha resetada com sucesso', newPassword });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao resetar senha' });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            await user.deleteOne();
            res.json({ message: 'Usuário removido' });
        } else {
            res.status(404).json({ message: 'Usuário não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao remover usuário' });
    }
};