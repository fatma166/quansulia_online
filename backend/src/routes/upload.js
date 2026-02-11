import express from 'express';
import {
  uploadFile,
  uploadMultipleFiles,
  deleteFile,
  getFile
} from '../controllers/uploadController.js';
import { upload } from '../middleware/upload.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/single', authenticateToken, upload.single('file'), uploadFile);

router.post('/multiple', authenticateToken, upload.array('files', 10), uploadMultipleFiles);

router.delete('/:filename', authenticateToken, deleteFile);

router.get('/:filename', getFile);

export default router;
