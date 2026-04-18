import express from 'express';
import { subscribe, unsubscribe } from '../controllers/pushController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/subscribe', protect, subscribe);
router.delete('/unsubscribe', protect, unsubscribe);

export default router;
