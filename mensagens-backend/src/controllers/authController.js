import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import log from '../config/logger.js';
import env from '../config/env.js';
import { ConflictError, UnauthorizedError } from '../middlewares/errorClasses.js';
import {
  generateAccessToken,
  generateRefreshToken,
  setRefreshCookie,
  clearRefreshCookie,
  REFRESH_COOKIE,
} from '../utils/tokens.js';

// Monta o payload público do usuário devolvido no login/registro/me.
const userResponse = (user, extra = {}) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  publicKey: user.publicKey,
  hasPrivateKeyBackup: !!user.privateKeyBackup,
  role: user.role || (user.isAdmin ? 'admin' : 'user'),
  isAdmin: user.isAdmin,
  vapidPublicKey: env.VAPID_PUBLIC_KEY,
  ...extra,
});

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  let user;
  try {
    user = await User.create({ name, email, password });
  } catch (err) {
    if (err.code === 11000) {
      throw new ConflictError('Usuário já existe');
    }
    throw err;
  }

  const token = generateAccessToken(user);
  setRefreshCookie(res, generateRefreshToken(user));

  log.info({ userId: user._id }, 'Usuário registrado com sucesso');
  res.status(201).json(userResponse(user, { token }));
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    log.warn({ requestId: req.requestId }, 'Login falhou - credenciais inválidas');
    throw new UnauthorizedError('Email ou senha inválidos');
  }

  if (user.active === false) {
    log.warn({ userId: user._id }, 'Login bloqueado - usuário desativado');
    // 403 semântico via classe dedicada seria ideal; usamos Unauthorized-like
    // mas mantemos 403 para não vazar existência da conta.
    const err = new UnauthorizedError('Conta desativada');
    err.statusCode = 403;
    throw err;
  }

  const token = generateAccessToken(user);
  setRefreshCookie(res, generateRefreshToken(user));

  log.info({ userId: user._id }, 'Login realizado com sucesso');
  res.json(userResponse(user, { token }));
};

export const refreshToken = async (req, res) => {
  // O refresh vive num cookie httpOnly; aceitamos o body como fallback de
  // compatibilidade durante a transição de clientes.
  const presented = req.cookies?.[REFRESH_COOKIE] || req.body?.refreshToken;

  if (!presented) {
    throw new UnauthorizedError('Sessão expirada');
  }

  let decoded;
  try {
    decoded = jwt.verify(presented, env.JWT_REFRESH_SECRET);
  } catch {
    clearRefreshCookie(res);
    throw new UnauthorizedError('Sessão expirada');
  }

  if (decoded.type !== 'refresh') {
    clearRefreshCookie(res);
    throw new UnauthorizedError('Sessão expirada');
  }

  const user = await User.findById(decoded.id).select('-password');

  if (!user || user.active === false || (decoded.tokenVersion ?? 0) !== (user.tokenVersion ?? 0)) {
    clearRefreshCookie(res);
    log.warn({ userId: decoded.id, requestId: req.requestId }, 'Refresh inválido/revogado');
    throw new UnauthorizedError('Sessão expirada');
  }

  const token = generateAccessToken(user);
  setRefreshCookie(res, generateRefreshToken(user)); // rotação

  log.info({ userId: user._id }, 'Token renovado');
  res.json({ token, ...userResponse(user) });
};

export const logout = async (req, res) => {
  clearRefreshCookie(res);
  res.status(200).json({ message: 'Sessão encerrada' });
};

export const getMe = async (req, res) => {
  res.status(200).json(userResponse(req.user));
};
