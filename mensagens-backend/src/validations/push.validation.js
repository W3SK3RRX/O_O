import { z } from 'zod';

export const pushSubscribeSchema = z.object({
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string().min(1),
      auth: z.string().min(1),
    }),
    expirationTime: z.number().nullable().optional(),
  }),
});

export const pushUnsubscribeSchema = z.object({
  endpoint: z.string().url(),
});
