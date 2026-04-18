import PushSubscription from '../models/PushSubscription.js';
import log from '../config/logger.js';

export const subscribe = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { subscription } = req.body;

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'Subscription inválida' } });
    }

    await PushSubscription.findOneAndUpdate(
      { userId, 'subscription.endpoint': subscription.endpoint },
      { userId, subscription },
      { upsert: true, new: true }
    );

    log.info({ userId }, 'Push subscription salva');
    res.status(201).json({ message: 'Subscription registrada' });
  } catch (err) {
    next(err);
  }
};

export const unsubscribe = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { endpoint } = req.body;

    await PushSubscription.deleteOne({ userId, 'subscription.endpoint': endpoint });

    log.info({ userId }, 'Push subscription removida');
    res.json({ message: 'Subscription removida' });
  } catch (err) {
    next(err);
  }
};
