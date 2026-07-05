import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  MONGO_URI: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().default('1h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  VAPID_PUBLIC_KEY: z.string().min(1),
  VAPID_PRIVATE_KEY: z.string().min(1),
  VAPID_SUBJECT: z.string().min(1),
  // Segredo que cifra os backups de chave privada E2E no banco. Deve ser distinto
  // do JWT_SECRET (desacopla rotação de sessão da cifra de backups). Opcional aqui
  // para compatibilidade: keyBackupCipher cai no JWT_SECRET se ausente.
  KEY_BACKUP_SECRET: z.string().optional(),
  // Opcional: quando definido, o Socket.io usa o adapter Redis (escala horizontal).
  REDIS_URL: z.string().optional(),
}).superRefine((data, ctx) => {
  // Em produção, exige segredos fortes (>= 32 chars) com base no NODE_ENV já normalizado
  if (data.NODE_ENV === 'production') {
    for (const key of ['JWT_SECRET', 'JWT_REFRESH_SECRET']) {
      if (data[key].length < 32) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message: `${key} deve ter pelo menos 32 caracteres em produção`,
        });
      }
    }
    // Alerta (não fatal) se o segredo de backup não for distinto do JWT.
    if (data.KEY_BACKUP_SECRET && data.KEY_BACKUP_SECRET === data.JWT_SECRET) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['KEY_BACKUP_SECRET'],
        message: 'KEY_BACKUP_SECRET deve ser distinto de JWT_SECRET',
      });
    }
  }
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Variáveis de ambiente inválidas:', JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export default parsed.data;
