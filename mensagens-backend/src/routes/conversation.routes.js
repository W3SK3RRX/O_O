import express from 'express';
// FIX: Importação nomeada (com chaves) em vez de default
import { protect } from '../middlewares/authMiddleware.js'; 
import { createConversation, getUserConversations } from '../controllers/conversationController.js';

const router = express.Router();

router.use(protect);

router.post('/', createConversation);
router.get('/', getUserConversations);

export default router;