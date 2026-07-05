import Attachment from '../models/Attachment.js';
import Conversation from '../models/Conversation.js';
import log from '../config/logger.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../middlewares/errorClasses.js';

// Teto do ciphertext armazenado (~10MB). O cliente deve capar o tamanho do
// arquivo em claro bem abaixo disso.
const MAX_CIPHER_BYTES = 10 * 1024 * 1024;

export const uploadAttachment = async (req, res) => {
  const userId = req.user._id;
  const { conversationId, name, mime, cipherBase64 } = req.body;

  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  }).select('_id');

  if (!conversation) throw new ForbiddenError('Acesso negado à conversa');

  const buffer = Buffer.from(cipherBase64, 'base64');
  if (buffer.length === 0) throw new ValidationError('Anexo vazio ou inválido');
  if (buffer.length > MAX_CIPHER_BYTES) {
    const err = new ValidationError('Anexo excede o tamanho máximo');
    err.statusCode = 413;
    throw err;
  }

  const attachment = await Attachment.create({
    conversationId,
    uploader: userId,
    mime: (mime || 'application/octet-stream').slice(0, 100),
    name: (name || '').slice(0, 255),
    size: buffer.length,
    data: buffer,
  });

  log.info({ attachmentId: attachment._id, conversationId, size: buffer.length }, 'Anexo enviado');
  res.status(201).json({
    attachmentId: attachment._id,
    name: attachment.name,
    mime: attachment.mime,
    size: attachment.size,
  });
};

export const getAttachment = async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  if (!/^[0-9a-fA-F]{24}$/.test(id)) throw new ValidationError('ID inválido');

  const attachment = await Attachment.findById(id);
  if (!attachment) throw new NotFoundError('Anexo');

  const conversation = await Conversation.findOne({
    _id: attachment.conversationId,
    participants: userId,
  }).select('_id');
  if (!conversation) throw new ForbiddenError('Acesso negado ao anexo');

  // O ciphertext é imutável — cacheável pelo navegador (privado, não por proxies).
  res.set('Cache-Control', 'private, max-age=31536000, immutable');
  res.status(200).json({
    mime: attachment.mime,
    name: attachment.name,
    size: attachment.size,
    cipherBase64: attachment.data.toString('base64'),
  });
};
