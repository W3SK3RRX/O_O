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

// Schema para envio de mensagem
export const sendMessageSchema = z.object({
  conversationId: z.string().min(1, 'conversationId é obrigatório'),
  cipherText: z.string().min(1, 'cipherText é obrigatório'),
  iv: z.string().min(1, 'iv é obrigatório'),
});

// Schema para salvar chaves da conversa
export const saveConversationKeysSchema = z.object({
  encryptedKeys: z.record(z.string(), z.string()),
  keyVersion: z.number().int().optional(),
});

// Schema para paginação
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
