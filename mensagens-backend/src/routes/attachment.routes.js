import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { uploadAttachmentSchema } from '../validations/message.validation.js';
import { uploadAttachment, getAttachment } from '../controllers/attachmentController.js';

const router = express.Router();

router.use(protect);

// Upload: ciphertext no corpo binário (octet-stream), metadados na query string.
// Sem base64/JSON — o parser global de JSON não casa com octet-stream e é ignorado.
router.post(
  '/',
  express.raw({ type: 'application/octet-stream', limit: '12mb' }),
  validate(uploadAttachmentSchema, 'query'),
  uploadAttachment
);
router.get('/:id', getAttachment);

export default router;
