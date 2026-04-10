import { z } from 'zod';

// Schema para criação de conversa
export const createConversationSchema = z.object({
  receiverId: z.string().min(1, 'receiverId é obrigatório'),
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
});

// Schema para paginação
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
