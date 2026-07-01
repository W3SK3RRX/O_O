import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { uploadAttachmentSchema } from '../validations/message.validation.js';
import { uploadAttachment, getAttachment } from '../controllers/attachmentController.js';

const router = express.Router();

router.use(protect);

router.post('/', validate(uploadAttachmentSchema), uploadAttachment);
router.get('/:id', getAttachment);

export default router;
