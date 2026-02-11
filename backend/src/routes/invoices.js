import express from 'express';
import {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice
} from '../controllers/invoicesController.js';
import { authenticateToken, requirePermission } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, requirePermission('view_invoices'), getAllInvoices);

router.get('/:id', authenticateToken, requirePermission('view_invoices'), getInvoiceById);

router.post('/', authenticateToken, requirePermission('manage_invoices'), createInvoice);

router.put('/:id', authenticateToken, requirePermission('manage_invoices'), updateInvoice);

router.delete('/:id', authenticateToken, requirePermission('manage_invoices'), deleteInvoice);

export default router;
