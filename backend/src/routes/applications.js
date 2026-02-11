import express from 'express';
import {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplicationStatus,
  deleteApplication
} from '../controllers/applicationsController.js';
import { authenticateToken, requirePermission } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, requirePermission('view_applications'), getApplications);

router.get('/:id', authenticateToken, requirePermission('view_applications'), getApplicationById);

router.post('/', createApplication);

router.put('/:id/status', authenticateToken, requirePermission('manage_applications'), updateApplicationStatus);

router.delete('/:id', authenticateToken, requirePermission('manage_applications'), deleteApplication);

export default router;
