import express from 'express';
import {
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews
} from '../controllers/newsController.js';
import { authenticateToken, requirePermission } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllNews);

router.get('/:id', getNewsById);

router.post('/', authenticateToken, requirePermission('manage_content'), createNews);

router.put('/:id', authenticateToken, requirePermission('manage_content'), updateNews);

router.delete('/:id', authenticateToken, requirePermission('manage_content'), deleteNews);

export default router;
