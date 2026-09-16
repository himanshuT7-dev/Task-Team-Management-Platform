import express from 'express';
import {
  registerUser,
  loginUser,
  getCurrentUserProfile
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', authenticateToken, getCurrentUserProfile);

export default router;
