import rateLimit from 'express-rate-limit';

// Rate limiter global para todas as rotas API
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições por IP por janela
  message: { message: 'Muitas requisições. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter mais restrito para rotas de autenticação
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // 10 tentativas de login/register por IP
  message: { message: 'Muitas tentativas. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter para envio de mensagens (mais permissivo para conversas ativas)
export const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 30, // 30 mensagens por minuto
  message: { message: 'Muitas mensagens. Diminua o ritmo.' },
  standardHeaders: true,
  legacyHeaders: false,
});
