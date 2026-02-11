import express from 'express';
import {
  getAllShipments,
  getShipmentById,
  createShipment,
  updateShipment,
  deleteShipment,
  addTrackingUpdate,
  getShippingCompanies,
  createShippingCompany,
  updateShippingCompany,
  deleteShippingCompany
} from '../controllers/shipmentsController.js';
import { authenticateToken, requirePermission } from '../middleware/auth.js';

const router = express.Router();

router.get('/companies', getShippingCompanies);

router.post('/companies', authenticateToken, requirePermission('manage_shipments'), createShippingCompany);

router.put('/companies/:id', authenticateToken, requirePermission('manage_shipments'), updateShippingCompany);

router.delete('/companies/:id', authenticateToken, requirePermission('manage_shipments'), deleteShippingCompany);

router.get('/', authenticateToken, requirePermission('view_shipments'), getAllShipments);

router.get('/:id', getShipmentById);

router.post('/', authenticateToken, requirePermission('manage_shipments'), createShipment);

router.put('/:id', authenticateToken, requirePermission('manage_shipments'), updateShipment);

router.delete('/:id', authenticateToken, requirePermission('manage_shipments'), deleteShipment);

router.post('/:shipment_id/tracking', authenticateToken, requirePermission('manage_shipments'), addTrackingUpdate);

export default router;
