import express from 'express';
// FIX: Importação nomeada (com chaves) em vez de default
import { protect } from '../middlewares/authMiddleware.js'; 
import { createConversation, getUserConversations, saveConversationKeys } from '../controllers/conversationController.js';

const router = express.Router();

router.use(protect);

router.post('/', createConversation);
router.get('/', getUserConversations);
router.post('/:conversationId/keys', saveConversationKeys);

export default router;