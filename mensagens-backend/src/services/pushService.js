import webpush from 'web-push';
import PushSubscription from '../models/PushSubscription.js';
import log from '../config/logger.js';

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
);

export const sendPushToUser = async (userId, payload) => {
  const subs = await PushSubscription.find({ userId });
  if (!subs.length) return;

  const payloadStr = JSON.stringify(payload);

  await Promise.allSettled(
    subs.map(async (doc) => {
      try {
        await webpush.sendNotification(doc.subscription, payloadStr);
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await PushSubscription.deleteOne({ _id: doc._id });
          log.info({ userId, endpoint: doc.subscription.endpoint }, 'Push subscription removida (expirada)');
        } else {
          log.warn({ err: err.message, userId }, 'Erro ao enviar push');
        }
      }
    })
  );
};
