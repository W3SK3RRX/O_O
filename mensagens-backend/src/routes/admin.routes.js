import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { adminOnly } from '../middlewares/adminOnly.js';
import { validate } from '../middlewares/validate.js';
import {
  adminCreateUserSchema,
  adminUpdateUserSchema,
  toggleStatusSchema,
  idParamSchema,
} from '../validations/user.validation.js';
import { paginationSchema } from '../validations/message.validation.js';
import {
  getDashboardStats,
  getOnlineUsers,
  getAllUsers,
  createUser,
  updateUser,
  toggleUserStatus,
  resetUserPassword,
  deleteUser,
} from '../controllers/adminController.js';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/online', getOnlineUsers);
router.get('/users', validate(paginationSchema, 'query'), getAllUsers);
router.post('/users', validate(adminCreateUserSchema), createUser);
router.patch('/users/:id', validate(idParamSchema, 'params'), validate(adminUpdateUserSchema), updateUser);
router.patch('/users/:id/status', validate(idParamSchema, 'params'), validate(toggleStatusSchema), toggleUserStatus);
router.post('/users/:id/reset-password', validate(idParamSchema, 'params'), resetUserPassword);
router.delete('/users/:id', validate(idParamSchema, 'params'), deleteUser);

export default router;
