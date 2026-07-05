import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import log from '../config/logger.js';
import env from '../config/env.js';
import { UnauthorizedError } from './errorClasses.js';

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return next(new UnauthorizedError('Token não fornecido'));
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Só access tokens autorizam rotas HTTP (um refresh token não vale como access).
    if (decoded.type !== 'access') {
      return next(new UnauthorizedError('Token inválido ou expirado'));
    }

    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return next(new UnauthorizedError('Usuário não encontrado'));
    }

    if (req.user.active === false) {
      return next(new UnauthorizedError('Conta desativada'));
    }

    // Revogação: token emitido com versão anterior à atual foi invalidado
    // (troca de senha, reset ou desativação).
    if ((decoded.tokenVersion ?? 0) !== (req.user.tokenVersion ?? 0)) {
      return next(new UnauthorizedError('Sessão expirada'));
    }

    next();
  } catch (error) {
    log.warn({ error: error.message, requestId: req.requestId }, 'Token inválido');
    return next(new UnauthorizedError('Token inválido ou expirado'));
  }
};
