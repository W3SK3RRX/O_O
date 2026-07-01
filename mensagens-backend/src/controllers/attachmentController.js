import Attachment from '../models/Attachment.js';
import Conversation from '../models/Conversation.js';
import log from '../config/logger.js';

// Teto do ciphertext armazenado (~10MB). O cliente deve caparo tamanho do
// arquivo em claro bem abaixo disso.
const MAX_CIPHER_BYTES = 10 * 1024 * 1024;

export const uploadAttachment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId, name, mime, cipherBase64 } = req.body;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(403).json({ message: 'Acesso negado à conversa' });
    }

    const buffer = Buffer.from(cipherBase64, 'base64');
    if (buffer.length === 0) {
      return res.status(400).json({ message: 'Anexo vazio ou inválido' });
    }
    if (buffer.length > MAX_CIPHER_BYTES) {
      return res.status(413).json({ message: 'Anexo excede o tamanho máximo' });
    }

    const attachment = await Attachment.create({
      conversationId,
      uploader: userId,
      mime: mime || 'application/octet-stream',
      name: name || '',
      size: buffer.length,
      data: buffer,
    });

    log.info({ attachmentId: attachment._id, conversationId, size: buffer.length }, 'Anexo enviado');
    return res.status(201).json({
      attachmentId: attachment._id,
      name: attachment.name,
      mime: attachment.mime,
      size: attachment.size,
    });
  } catch (error) {
    log.error({ error }, 'Erro ao enviar anexo');
    return res.status(500).json({ message: 'Erro ao enviar anexo' });
  }
};

export const getAttachment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }

    const attachment = await Attachment.findById(id);
    if (!attachment) {
      return res.status(404).json({ message: 'Anexo não encontrado' });
    }

    const conversation = await Conversation.findOne({
      _id: attachment.conversationId,
      participants: userId,
    });
    if (!conversation) {
      return res.status(403).json({ message: 'Acesso negado ao anexo' });
    }

    return res.status(200).json({
      mime: attachment.mime,
      name: attachment.name,
      size: attachment.size,
      cipherBase64: attachment.data.toString('base64'),
    });
  } catch (error) {
    log.error({ error }, 'Erro ao buscar anexo');
    return res.status(500).json({ message: 'Erro ao buscar anexo' });
  }
};
