import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { sendMessageSchema, paginationSchema } from '../validations/message.validation.js';
import { sendMessage, getMessagesByConversation } from '../controllers/messageController.js';

const router = express.Router();

router.post('/', protect, validate(sendMessageSchema), sendMessage);
router.get('/:conversationId', protect, validate(paginationSchema, 'query'), getMessagesByConversation);

export default router;
