import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import log from '../config/logger.js';
import env from '../config/env.js';

const generateToken = (id) => {
  return jwt.sign({ id, type: 'access' }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id, type: 'refresh' }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    log.info({ email }, 'Tentativa de registro');

    let user;
    try {
      user = await User.create({
        name,
        email,
        password,
      });
    } catch (err) {
      // Índice único de email (trata também race condition de cadastro simultâneo)
      if (err.code === 11000) {
        log.warn({ email }, 'Usuário já existe');
        return res.status(409).json({ message: 'Usuário já existe' });
      }
      throw err;
    }

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
      role: user.role || (user.isAdmin ? 'admin' : 'user'),
      isAdmin: user.isAdmin,
      vapidPublicKey: env.VAPID_PUBLIC_KEY,
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

    if (user.active === false) {
      log.warn({ userId: user._id }, 'Login bloqueado - usuário desativado');
      return res.status(403).json({ message: 'Conta desativada' });
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
      vapidPublicKey: env.VAPID_PUBLIC_KEY,
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

    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);

    // Garante que o token apresentado é de fato um refresh token
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ message: 'Token inválido ou expirado' });
    }

    const user = await User.findById(decoded.id).select('-password');

    if (!user || user.active === false) {
      log.warn({ userId: decoded.id }, 'Refresh token - usuário inválido ou desativado');
      return res.status(401).json({ message: 'Token inválido ou expirado' });
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
      vapidPublicKey: env.VAPID_PUBLIC_KEY,
    };
    res.status(200).json(user);
  } catch (error) {
    log.error({ error }, 'Erro ao buscar dados do usuário');
    res.status(500).json({ message: 'Erro ao buscar dados do usuário' });
  }
};