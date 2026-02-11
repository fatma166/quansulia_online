import express from 'express';
import {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointmentSettings,
  updateAppointmentSettings,
  getClosedDays,
  addClosedDay,
  deleteClosedDay,
  getAvailableSlots
} from '../controllers/appointmentsController.js';
import { authenticateToken, requirePermission } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, requirePermission('view_appointments'), getAllAppointments);

router.get('/available-slots', getAvailableSlots);

router.get('/settings', authenticateToken, requirePermission('manage_appointments'), getAppointmentSettings);

router.put('/settings', authenticateToken, requirePermission('manage_appointments'), updateAppointmentSettings);

router.get('/closed-days', getClosedDays);

router.post('/closed-days', authenticateToken, requirePermission('manage_appointments'), addClosedDay);

router.delete('/closed-days/:id', authenticateToken, requirePermission('manage_appointments'), deleteClosedDay);

router.get('/:id', authenticateToken, requirePermission('view_appointments'), getAppointmentById);

router.post('/', createAppointment);

router.put('/:id', authenticateToken, requirePermission('manage_appointments'), updateAppointment);

router.delete('/:id', authenticateToken, requirePermission('manage_appointments'), deleteAppointment);

export default router;
