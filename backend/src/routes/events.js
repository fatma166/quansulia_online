import express from 'express';
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventRegistrations,
  createEventRegistration
} from '../controllers/eventsController.js';
import { authenticateToken, requirePermission } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllEvents);

router.get('/:id', getEventById);

router.post('/', authenticateToken, requirePermission('manage_content'), createEvent);

router.put('/:id', authenticateToken, requirePermission('manage_content'), updateEvent);

router.delete('/:id', authenticateToken, requirePermission('manage_content'), deleteEvent);

router.get('/:event_id/registrations', authenticateToken, requirePermission('manage_content'), getEventRegistrations);

router.post('/registrations', createEventRegistration);

export default router;
