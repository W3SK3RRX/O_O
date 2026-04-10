import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { createConversationSchema, saveConversationKeysSchema, paginationSchema } from '../validations/message.validation.js';
import { 
  createConversation, 
  createGroup,
  addParticipant,
  removeParticipant,
  saveConversationKeys, 
  getUserConversations 
} from '../controllers/conversationController.js';

const router = express.Router();

router.use(protect);

router.post('/', validate(createConversationSchema), createConversation);
router.post('/group', createGroup);
router.post('/:conversationId/participants', addParticipant);
router.delete('/:conversationId/participants', removeParticipant);
router.get('/', validate(paginationSchema, 'query'), getUserConversations);
router.put('/:conversationId/keys', validate(saveConversationKeysSchema), saveConversationKeys);

export default router;
