import express from 'express';
import {
  getAllContactMessages,
  getContactMessageById,
  createContactMessage,
  updateContactMessageStatus,
  deleteContactMessage
} from '../controllers/contactController.js';
import { authenticateToken, requirePermission } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, requirePermission('view_contact_messages'), getAllContactMessages);

router.get('/:id', authenticateToken, requirePermission('view_contact_messages'), getContactMessageById);

router.post('/', createContactMessage);

router.put('/:id', authenticateToken, requirePermission('manage_contact_messages'), updateContactMessageStatus);

router.delete('/:id', authenticateToken, requirePermission('manage_contact_messages'), deleteContactMessage);

export default router;
