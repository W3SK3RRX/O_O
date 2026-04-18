import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import log from '../config/logger.js';
import { UnauthorizedError } from './errorClasses.js';

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return next(new UnauthorizedError('Token não fornecido'));
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return next(new UnauthorizedError('Usuário não encontrado'));
    }

    next();
  } catch (error) {
    log.warn({ error: error.message, requestId: req.requestId }, 'Token inválido');
    return next(new UnauthorizedError('Token inválido ou expirado'));
  }
};
