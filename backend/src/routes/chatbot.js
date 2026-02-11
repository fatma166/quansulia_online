import express from 'express';
import {
  getChatbotCategories,
  getChatbotQA,
  searchChatbotQA,
  createChatbotQA,
  updateChatbotQA,
  deleteChatbotQA
} from '../controllers/chatbotController.js';
import { authenticateToken, requirePermission } from '../middleware/auth.js';

const router = express.Router();

router.get('/categories', getChatbotCategories);

router.get('/qa', getChatbotQA);

router.get('/search', searchChatbotQA);

router.post('/qa', authenticateToken, requirePermission('manage_content'), createChatbotQA);

router.put('/qa/:id', authenticateToken, requirePermission('manage_content'), updateChatbotQA);

router.delete('/qa/:id', authenticateToken, requirePermission('manage_content'), deleteChatbotQA);

export default router;
