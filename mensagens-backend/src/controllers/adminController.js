import crypto from 'crypto';
import User from '../models/User.js';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import { onlineUsers } from '../store/onlineUsers.js';
import { disconnectUser } from '../config/ioRegistry.js';
import log from '../config/logger.js';
import { NotFoundError, ConflictError } from '../middlewares/errorClasses.js';

export const getDashboardStats = async (req, res) => {
  const [totalUsers, activeUsers, totalMessages, totalConversations] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ active: true }),
    Message.countDocuments(),
    Conversation.countDocuments(),
  ]);

  res.json({
    totalUsers,
    activeUsers,
    inactiveUsers: totalUsers - activeUsers,
    totalMessages,
    totalConversations,
  });
};

export const getOnlineUsers = async (req, res) => {
  const users = Array.from(onlineUsers.values()).map((user) => ({
    userId: user.userId,
    name: user.name,
    email: user.email,
    connectedAt: user.connectedAt,
    lastSeen: user.lastSeen,
  }));
  res.json(users);
};

export const getAllUsers = async (req, res) => {
  const { page, limit } = req.validatedQuery;
  const skip = (page - 1) * limit;

  const users = await User.find()
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = page === 1 ? await User.countDocuments() : undefined;

  res.json({
    users,
    pagination: {
      page,
      limit,
      ...(total !== undefined && { total, pages: Math.ceil(total / limit) }),
    },
  });
};

export const createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  const isAdmin = role === 'admin';

  let user;
  try {
    user = await User.create({ name, email, password, role, isAdmin, active: true });
  } catch (err) {
    if (err.code === 11000) throw new ConflictError('Usuário já existe');
    throw err;
  }

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isAdmin: user.isAdmin,
    active: user.active,
  });
};

export const updateUser = async (req, res) => {
  const { name, role, active } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) throw new NotFoundError('Usuário');

  if (name) user.name = name;
  if (role) {
    user.role = role;
    user.isAdmin = role === 'admin';
  }
  if (typeof active === 'boolean') {
    // Ao desativar, revoga sessões e derruba sockets.
    if (user.active && !active) {
      user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    }
    user.active = active;
  }

  await user.save();

  if (active === false) {
    onlineUsers.delete(user._id.toString());
    disconnectUser(user._id);
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isAdmin: user.isAdmin,
    active: user.active,
  });
};

export const toggleUserStatus = async (req, res) => {
  const { active } = req.body; // validado (boolean) pelo toggleStatusSchema

  const user = await User.findById(req.params.id);
  if (!user) throw new NotFoundError('Usuário');

  // Desativou: revoga todas as sessões (bump tokenVersion) e derruba sockets.
  if (user.active && !active) {
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
  }
  user.active = active;
  await user.save();

  if (!active) {
    onlineUsers.delete(user._id.toString());
    disconnectUser(user._id);
  }

  res.json({ message: `Usuário ${user.active ? 'ativado' : 'desativado'}` });
};

export const resetUserPassword = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new NotFoundError('Usuário');

  // Senha temporária criptograficamente segura
  const newPassword = crypto.randomBytes(9).toString('base64url').slice(0, 12);
  user.password = newPassword;
  // Revoga sessões antigas do usuário (força novo login com a senha temporária).
  user.tokenVersion = (user.tokenVersion ?? 0) + 1;
  await user.save();

  onlineUsers.delete(user._id.toString());
  disconnectUser(user._id);

  res.json({ message: 'Senha resetada com sucesso', newPassword });
};

export const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new NotFoundError('Usuário');

  await user.deleteOne();
  onlineUsers.delete(user._id.toString());
  disconnectUser(user._id);
  res.json({ message: 'Usuário removido' });
};
