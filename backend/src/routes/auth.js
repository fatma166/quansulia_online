import express from 'express';
import { login, createStaff, resetPassword, getProfile } from '../controllers/authController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);

router.post('/staff', authenticateToken, requireRole('super_admin'), createStaff);

router.put('/reset-password/:userId', authenticateToken, resetPassword);

router.get('/profile', authenticateToken, getProfile);

export default router;
