import { z } from 'zod';

// Schema para registro de usuário
export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

// Schema para login
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

// Schema para atualização de perfil
export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  avatar: z.string().url().optional().or(z.literal('')),
});

// Schema para atualização de chave pública
export const publicKeySchema = z.object({
  publicKey: z.string().min(1, 'Chave pública é obrigatória'),
});

export const keyPairSchema = z.object({
  publicKey: z.string().min(1, 'Chave pública é obrigatória'),
  privateKeyBackup: z.string().min(1, 'Backup da chave privada é obrigatório'),
});

// Schema para alteração de senha
export const changePasswordSchema = z.object({
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

// Schema para busca de usuários
export const searchUsersSchema = z.object({
  search: z.string().min(1, 'Termo de busca é obrigatório'),
});
