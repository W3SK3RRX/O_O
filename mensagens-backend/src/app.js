import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import log from "./config/logger.js";
import { globalLimiter, authLimiter, messageLimiter } from "./middlewares/rateLimiter.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";
import messageRoutes from "./routes/message.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();

/**
 * Trust proxy para funcionar atrás do Traefik
 */
app.set('trust proxy', 1);

/**
 * CORS configurado com origens permitidas
 */
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

/**
 * Rate limiting global
 */
app.use(globalLimiter);

/**
 * Health check (útil para testes e deploy)
 */
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

/**
 * Rotas da API
 * (serão criadas posteriormente)
 */
app.use("/auth", authLimiter, authRoutes);
app.use("/users", userRoutes);
app.use("/conversations", conversationRoutes);
app.use("/messages", messageLimiter, messageRoutes);
app.use("/admin", adminRoutes);

/**
 * Middleware de tratamento de erros
 */
app.use((err, req, res, next) => {
  log.error({ err, url: req.url, method: req.method }, 'Erro não tratado');
  
  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === 'production' 
      ? 'Erro interno do servidor' 
      : err.message,
  });
});

export default app;
