import express from 'express';
import { protect } from '../middlewares/authMiddleware.js'; // Certifique-se que o middleware também usa export default ou named export
import { sendMessage, getMessagesByConversation } from '../controllers/messageController.js';

const router = express.Router();

router.post('/', protect, sendMessage);
router.get('/:conversationId', protect, getMessagesByConversation);

export default router;