import express from 'express';
// FIX: Imports nomeados (com chaves)
import { protect } from '../middlewares/authMiddleware.js';
import { adminOnly } from '../middlewares/adminOnly.js';
import { 
    getDashboardStats, 
    getOnlineUsers,
    getAllUsers, 
    createUser, 
    updateUser,
    deleteUser 
} from '../controllers/adminController.js';

const router = express.Router();

// Aplica proteção e verificação de admin em todas as rotas abaixo
router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/online', getOnlineUsers);
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;