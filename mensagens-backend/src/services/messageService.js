import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import Attachment from '../models/Attachment.js';
import { ForbiddenError } from '../middlewares/errorClasses.js';

// Limites de tamanho para o conteúdo cifrado recebido (defesa contra DoS de
// storage por clientes autenticados). O ciphertext base64 de ~10MB de anexo
// vive na coleção Attachment; aqui trafegam só mensagens de texto.
export const MAX_CIPHERTEXT_BYTES = 64 * 1024; // 64KB de ciphertext por mensagem
export const MAX_IV_BYTES = 256;
export const MAX_ATTACHMENTS = 10;

const byteLen = (s) => (typeof s === 'string' ? Buffer.byteLength(s, 'utf8') : 0);

// Valida limites de tamanho do payload de mensagem. Lança Error com .code
// 'PAYLOAD_TOO_LARGE'/'INVALID_PAYLOAD' para o chamador tratar (HTTP ou ack).
export function assertMessagePayload({ cipherText, iv, attachments }) {
  if (!cipherText || !iv) {
    const e = new Error('cipherText e iv são obrigatórios');
    e.code = 'INVALID_PAYLOAD';
    throw e;
  }
  if (byteLen(cipherText) > MAX_CIPHERTEXT_BYTES || byteLen(iv) > MAX_IV_BYTES) {
    const e = new Error('Mensagem excede o tamanho máximo');
    e.code = 'PAYLOAD_TOO_LARGE';
    throw e;
  }
  if (Array.isArray(attachments) && attachments.length > MAX_ATTACHMENTS) {
    const e = new Error('Anexos demais');
    e.code = 'INVALID_PAYLOAD';
    throw e;
  }
}

// Cria uma mensagem cifrada e devolve o payload pronto para emitir/retornar.
// Usado tanto pela rota REST quanto pelo handler de socket — fonte única de verdade.
export async function createMessage({ senderId, senderName, conversationId, cipherText, iv, replyTo, attachments, clientId }) {
  assertMessagePayload({ cipherText, iv, attachments });

  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: senderId,
  });

  if (!conversation) {
    throw new ForbiddenError('Acesso negado à conversa');
  }

  // Valida que os anexos referenciados pertencem a esta conversa.
  let safeAttachments = [];
  if (Array.isArray(attachments) && attachments.length > 0) {
    const ids = attachments.map((a) => a.attachmentId).filter(Boolean);
    const owned = await Attachment.find({ _id: { $in: ids }, conversationId }).select('_id');
    const ownedSet = new Set(owned.map((a) => a._id.toString()));
    safeAttachments = attachments
      .filter((a) => a.attachmentId && ownedSet.has(a.attachmentId.toString()) && a.iv)
      .map((a) => ({
        attachmentId: a.attachmentId,
        name: (a.name || '').slice(0, 255),
        mime: (a.mime || 'application/octet-stream').slice(0, 100),
        size: a.size || 0,
        iv: a.iv,
      }));
  }

  // Só aceita replyTo se a mensagem citada for da mesma conversa.
  let safeReplyTo = null;
  if (replyTo) {
    const original = await Message.findOne({ _id: replyTo, conversationId }).select('_id');
    if (original) safeReplyTo = original._id;
  }

  const message = await Message.create({
    conversationId,
    sender: senderId,
    cipherText,
    iv,
    read: false,
    replyTo: safeReplyTo,
    attachments: safeAttachments,
  });

  conversation.lastMessage = message._id;
  // Quem envia já leu o histórico anterior — evita a própria mensagem contar
  // como não lida para o remetente.
  conversation.reads.set(senderId.toString(), new Date());
  await conversation.save();

  await message.populate({
    path: 'replyTo',
    select: 'cipherText iv deleted sender',
    populate: { path: 'sender', select: 'name' },
  });

  const replyPreview = message.replyTo
    ? {
        _id: message.replyTo._id,
        cipherText: message.replyTo.cipherText,
        iv: message.replyTo.iv,
        deleted: message.replyTo.deleted,
        senderName: message.replyTo.sender?.name ?? null,
      }
    : null;

  const payload = {
    _id: message._id,
    conversationId,
    senderId,
    senderName,
    cipherText,
    iv,
    createdAt: message.createdAt,
    replyTo: replyPreview,
    attachments: safeAttachments,
    reactions: [],
    clientId: clientId ?? null,
  };

  return { conversation, message, payload };
}
