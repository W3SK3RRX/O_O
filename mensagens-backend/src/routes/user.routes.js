import express from 'express';
// FIX: Imports nomeados corretamente
import { searchUsers, getProfile, updatePublicKey, changePassword} from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';


const router = express.Router();

router.use(protect);

router.get('/search', searchUsers);
router.get('/profile', getProfile);
router.patch('/public-key', updatePublicKey);

router.post('/change-password', changePassword);
// FIX: Exportação padrão necessária para o import "import userRoutes from ..." funcionar
export default router;