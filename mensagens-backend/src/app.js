import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { randomUUID } from 'crypto';
import log from './config/logger.js';
import { globalLimiter, messageLimiter } from './middlewares/rateLimiter.js';
import errorHandler from './middlewares/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import conversationRoutes from './routes/conversation.routes.js';
import messageRoutes from './routes/message.routes.js';
import attachmentRoutes from './routes/attachment.routes.js';
import adminRoutes from './routes/admin.routes.js';
import pushRoutes from './routes/push.routes.js';

const app = express();

// Trust proxy para funcionar atrás do Nginx/Traefik
app.set('trust proxy', 1);

// Segurança de headers (primeiro middleware)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'", 'ws:', 'wss:'],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true },
}));

// Compressão de respostas (gzip). Ganho grande em payloads base64 (ciphertext).
app.use(compression());

// CORS com origens explícitas via env
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  maxAge: 86400,
};
app.use(cors(corsOptions));

// X-Request-ID para rastreabilidade — antes dos limiters, para que respostas
// 429 também carreguem o header de correlação.
app.use((req, res, next) => {
  req.requestId = req.headers['x-request-id'] || randomUUID();
  res.set('X-Request-ID', req.requestId);
  next();
});

// Rate limiting global (antes de processar o body)
app.use(globalLimiter);

// Parse de body.
// Anexos (ciphertext em base64) precisam de um limite maior; este parser casa
// só com /api/attachments e roda ANTES do global de 1mb. express.json marca
// req._body, então o parser global abaixo é ignorado para essa rota.
app.use('/api/attachments', express.json({ limit: '12mb' }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Health check — reflete o estado real da conexão com o Mongo (readyState 1 = connected).
app.get('/health', (req, res) => {
  const dbUp = mongoose.connection.readyState === 1;
  res.status(dbUp ? 200 : 503).json({ status: dbUp ? 'OK' : 'DEGRADED', db: dbUp });
});

// Rotas (limiters de auth aplicados por rota dentro de authRoutes)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageLimiter, messageRoutes);
app.use('/api/attachments', attachmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/push', pushRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Rota não encontrada' } });
});

// Error handler centralizado (deve ser o último)
app.use(errorHandler);

export default app;
