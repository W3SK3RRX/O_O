import express from 'express';
import { subscribe, unsubscribe } from '../controllers/pushController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { pushSubscribeSchema, pushUnsubscribeSchema } from '../validations/push.validation.js';

const router = express.Router();

router.post('/subscribe', protect, validate(pushSubscribeSchema), subscribe);
router.delete('/unsubscribe', protect, validate(pushUnsubscribeSchema), unsubscribe);

export default router;
