import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Rutas públicas
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Rutas protegidas
router.get('/me', authenticateToken, AuthController.me);

export default router;
