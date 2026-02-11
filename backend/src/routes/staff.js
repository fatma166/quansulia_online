import express from 'express';
import {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  updateStaffPermissions
} from '../controllers/staffController.js';
import { authenticateToken, requirePermission } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, requirePermission('manage_staff'), getAllStaff);

router.get('/:id', authenticateToken, requirePermission('manage_staff'), getStaffById);

router.post('/', authenticateToken, requirePermission('manage_staff'), createStaff);

router.put('/:id', authenticateToken, requirePermission('manage_staff'), updateStaff);

router.delete('/:id', authenticateToken, requirePermission('manage_staff'), deleteStaff);

router.put('/:id/permissions', authenticateToken, requirePermission('manage_staff'), updateStaffPermissions);

export default router;
