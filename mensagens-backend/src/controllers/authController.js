import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import log from '../config/logger.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    log.info({ email }, 'Tentativa de registro');

    const userExists = await User.findOne({ email });

    if (userExists) {
      log.warn({ email }, 'Usuário já existe');
      return res.status(400).json({ message: 'Usuário já existe' });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    log.info({ userId: user._id }, 'Usuário registrado com sucesso');

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      publicKey: user.publicKey,
      hasPrivateKeyBackup: !!user.privateKeyBackup,
      token,
      refreshToken,
      vapidPublicKey: process.env.VAPID_PUBLIC_KEY,
    });
  } catch (error) {
    log.error({ error }, 'Erro ao registrar usuário');
    res.status(500).json({ message: 'Erro ao registrar usuário' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    log.info({ email }, 'Tentativa de login');

    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      log.warn({ email }, 'Login falhou - credenciais inválidas');
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    log.info({ userId: user._id }, 'Login realizado com sucesso');

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      publicKey: user.publicKey,
      hasPrivateKeyBackup: !!user.privateKeyBackup,
      token,
      refreshToken,
      role: user.role || (user.isAdmin ? 'admin' : 'user'),
      isAdmin: user.isAdmin,
      vapidPublicKey: process.env.VAPID_PUBLIC_KEY,
    });
  } catch (error) {
    log.error({ error }, 'Erro ao fazer login');
    res.status(500).json({ message: 'Erro ao fazer login' });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token é obrigatório' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      log.warn({ userId: decoded.id }, 'Refresh token - usuário não encontrado');
      return res.status(401).json({ message: 'Token inválido' });
    }

    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    log.info({ userId: user._id }, 'Token refreshido com sucesso');

    res.json({
      token: newToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    log.error({ error }, 'Erro ao refresh token');
    res.status(401).json({ message: 'Token inválido ou expirado' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
      publicKey: req.user.publicKey,
      hasPrivateKeyBackup: !!req.user.privateKeyBackup,
      role: req.user.role || (req.user.isAdmin ? 'admin' : 'user'),
      isAdmin: req.user.isAdmin,
      vapidPublicKey: process.env.VAPID_PUBLIC_KEY,
    };
    res.status(200).json(user);
  } catch (error) {
    log.error({ error }, 'Erro ao buscar dados do usuário');
    res.status(500).json({ message: 'Erro ao buscar dados do usuário' });
  }
};