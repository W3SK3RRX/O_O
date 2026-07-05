import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js';
import {
  createConversationSchema,
  createGroupSchema,
  participantSchema,
  saveConversationKeysSchema,
  paginationSchema,
  conversationIdParamSchema,
} from '../validations/message.validation.js';
import {
  createConversation,
  createGroup,
  addParticipant,
  removeParticipant,
  saveConversationKeys,
  getUserConversations,
  getConversationById,
  markConversationRead,
} from '../controllers/conversationController.js';

const router = express.Router();

router.use(protect);

router.post('/', validate(createConversationSchema), createConversation);
router.post('/group', validate(createGroupSchema), createGroup);
router.post('/:conversationId/participants', validate(participantSchema), addParticipant);
router.delete('/:conversationId/participants', validate(participantSchema), removeParticipant);
router.get('/', validate(paginationSchema, 'query'), getUserConversations);
router.get('/:conversationId', validate(conversationIdParamSchema, 'params'), getConversationById);
router.put('/:conversationId/keys', validate(saveConversationKeysSchema), saveConversationKeys);
router.patch('/:conversationId/read', markConversationRead);

export default router;
