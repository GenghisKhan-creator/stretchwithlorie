import express from 'express';
import {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  uploadClassImage
} from '../controllers/classesController.js';
import { requireAdminAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes for browsing experiences
router.get('/', getAllClasses);
router.get('/:id', getClassById);

// Protected Admin-Only management routes
router.post('/upload-image', requireAdminAuth, express.json({ limit: '15mb' }), uploadClassImage);
router.post('/', requireAdminAuth, express.json({ limit: '15mb' }), createClass);
router.put('/:id', requireAdminAuth, express.json({ limit: '15mb' }), updateClass);
router.delete('/:id', requireAdminAuth, deleteClass);

export default router;
