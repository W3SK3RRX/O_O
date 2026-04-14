import express from 'express';
import {
  searchUsers,
  getProfile,
  updatePublicKey,
  updateKeyPair,
  changePassword,
  getPrivateKeyBackup,
} from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js';
import {
  publicKeySchema,
  keyPairSchema,
  changePasswordSchema,
  searchUsersSchema,
} from '../validations/user.validation.js';

const router = express.Router();

router.use(protect);

router.get('/search', validate(searchUsersSchema, 'query'), searchUsers);
router.get('/profile', getProfile);
router.patch('/public-key', validate(publicKeySchema), updatePublicKey);
router.patch('/key-pair', validate(keyPairSchema), updateKeyPair);
router.post('/change-password', validate(changePasswordSchema), changePassword);
router.get('/key-backup', getPrivateKeyBackup);

export default router;