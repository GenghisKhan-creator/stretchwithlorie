import express from 'express';
import {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass
} from '../controllers/classesController.js';
import { requireAdminAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes for browsing experiences
router.get('/', getAllClasses);
router.get('/:id', getClassById);

// Protected Admin-Only management routes
router.post('/', requireAdminAuth, createClass);
router.put('/:id', requireAdminAuth, updateClass);
router.delete('/:id', requireAdminAuth, deleteClass);

export default router;
