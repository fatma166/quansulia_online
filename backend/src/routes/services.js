import express from 'express';
import {
  getServices,
  getServiceById,
  getCategories,
  getSubcategories,
  getRegions
} from '../controllers/servicesController.js';

const router = express.Router();

router.get('/', getServices);

router.get('/categories', getCategories);

router.get('/subcategories', getSubcategories);

router.get('/regions', getRegions);

router.get('/:id', getServiceById);

export default router;
