import { z } from 'zod';

// Valida um ObjectId do MongoDB (24 caracteres hexadecimais)
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID inválido');

// Schema para criação de conversa
export const createConversationSchema = z.object({
  receiverId: objectId,
});

// Schema para criação de grupo
export const createGroupSchema = z.object({
  name: z.string().trim().min(1, 'Nome do grupo é obrigatório'),
  participants: z.array(objectId).min(2, 'Grupo precisa de pelo menos 2 outros participantes'),
});

// Schema para adicionar/remover participante
export const participantSchema = z.object({
  userId: objectId,
});

// Schema para envio de mensagem. Limites de tamanho também são reforçados no
// messageService (caminho do socket não passa por aqui).
export const sendMessageSchema = z.object({
  conversationId: objectId,
  cipherText: z.string().min(1, 'cipherText é obrigatório').max(65536, 'Mensagem muito grande'),
  iv: z.string().min(1, 'iv é obrigatório').max(256),
  replyTo: objectId.optional().nullable(),
  clientId: z.string().max(128).optional().nullable(),
  attachments: z
    .array(
      z.object({
        attachmentId: objectId,
        name: z.string().max(255).optional(),
        mime: z.string().max(100).optional(),
        size: z.number().int().nonnegative().optional(),
        iv: z.string().min(1).max(256),
      })
    )
    .max(10)
    .optional(),
});

// Schema para upload de anexo criptografado. O ciphertext vai no corpo binário
// (octet-stream); estes metadados vêm na query string.
export const uploadAttachmentSchema = z.object({
  conversationId: objectId,
  name: z.string().max(255).optional(),
  mime: z.string().max(100).optional(),
});

// Schema para salvar chaves da conversa
export const saveConversationKeysSchema = z.object({
  encryptedKeys: z.record(z.string(), z.string()),
  keyVersion: z.number().int().optional(),
});

// Schema para validar :conversationId na URL
export const conversationIdParamSchema = z.object({
  conversationId: objectId,
});

// Schema para paginação
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
