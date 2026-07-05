import PushSubscription from '../models/PushSubscription.js';
import log from '../config/logger.js';

export const subscribe = async (req, res) => {
  const userId = req.user._id;
  const { subscription } = req.body; // validado por pushSubscribeSchema

  await PushSubscription.findOneAndUpdate(
    { userId, 'subscription.endpoint': subscription.endpoint },
    { userId, subscription },
    { upsert: true, new: true }
  );

  log.info({ userId }, 'Push subscription salva');
  res.status(201).json({ message: 'Subscription registrada' });
};

export const unsubscribe = async (req, res) => {
  const userId = req.user._id;
  const { endpoint } = req.body; // validado por pushUnsubscribeSchema

  await PushSubscription.deleteOne({ userId, 'subscription.endpoint': endpoint });

  log.info({ userId }, 'Push subscription removida');
  res.json({ message: 'Subscription removida' });
};
