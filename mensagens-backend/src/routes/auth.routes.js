import express from 'express';
import { register, login, getMe, refreshToken, logout } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { authLimiter, refreshLimiter } from '../middlewares/rateLimiter.js';
import { registerSchema, loginSchema } from '../validations/user.validation.js';

const router = express.Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
// Limiter dedicado: refresh bem-sucedido também conta (ver rateLimiter.js).
router.post('/refresh', refreshLimiter, refreshToken);
router.post('/logout', logout);
router.get('/me', protect, getMe);

export default router;
