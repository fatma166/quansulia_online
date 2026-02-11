import express from 'express';
import {
  getAllCMSSections,
  updateCMSSection,
  getHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getMaintenanceStatus,
  updateMaintenanceStatus
} from '../controllers/cmsController.js';
import { authenticateToken, requirePermission } from '../middleware/auth.js';

const router = express.Router();

router.get('/sections', getAllCMSSections);

router.put('/sections/:section_key', authenticateToken, requirePermission('manage_content'), updateCMSSection);

router.get('/hero-slides', getHeroSlides);

router.post('/hero-slides', authenticateToken, requirePermission('manage_content'), createHeroSlide);

router.put('/hero-slides/:id', authenticateToken, requirePermission('manage_content'), updateHeroSlide);

router.delete('/hero-slides/:id', authenticateToken, requirePermission('manage_content'), deleteHeroSlide);

router.get('/announcements', getAnnouncements);

router.post('/announcements', authenticateToken, requirePermission('manage_content'), createAnnouncement);

router.put('/announcements/:id', authenticateToken, requirePermission('manage_content'), updateAnnouncement);

router.delete('/announcements/:id', authenticateToken, requirePermission('manage_content'), deleteAnnouncement);

router.get('/maintenance', getMaintenanceStatus);

router.put('/maintenance', authenticateToken, requirePermission('manage_content'), updateMaintenanceStatus);

export default router;
