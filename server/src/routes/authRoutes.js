import { Router } from 'express';
import { register, login, logout, getMe } from '../controllers/authController.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.post('/logout', logout);
router.get('/me', getMe);

export default router;
