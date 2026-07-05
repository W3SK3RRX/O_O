import jwt from 'jsonwebtoken';
import env from '../config/env.js';

// Access e refresh carregam a tokenVersion do usuário no momento da emissão.
// protect/socketAuth/refresh comparam com a versão atual do usuário e rejeitam
// se divergir — é assim que troca de senha/desativação revogam sessões antigas.
export const generateAccessToken = (user) =>
  jwt.sign(
    { id: user._id, type: 'access', tokenVersion: user.tokenVersion ?? 0 },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

export const generateRefreshToken = (user) =>
  jwt.sign(
    { id: user._id, type: 'refresh', tokenVersion: user.tokenVersion ?? 0 },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
  );

export const REFRESH_COOKIE = 'refreshToken';

// Cookie httpOnly restrito a /api/auth (única rota que precisa do refresh).
// Secure só em produção (dev roda em http://localhost). SameSite=Lax cobre o
// mesmo site em portas diferentes (dev) e o mesmo domínio em produção.
const cookieBase = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/api/auth',
});

export const setRefreshCookie = (res, token) =>
  res.cookie(REFRESH_COOKIE, token, {
    ...cookieBase(),
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

export const clearRefreshCookie = (res) => res.clearCookie(REFRESH_COOKIE, cookieBase());
