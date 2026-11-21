import express from 'express';
import {
  getAllVideos,
  getVideoById,
  createVideo,
  purchaseVideo,
  getAllVideoPurchases
} from '../controllers/videosController.js';
import { requireAdminAuth } from '../middleware/authMiddleware.js';
import { bookingWriteLimiter } from '../middleware/securityMiddleware.js';

const router = express.Router();

// Public routes (watch 30s preview & unlock full video — rate-limited on purchase)
router.get('/', getAllVideos);
router.get('/:id', getVideoById);
router.post('/:id/purchase', bookingWriteLimiter, purchaseVideo);

// Protected Admin-Only routes
router.post('/', requireAdminAuth, createVideo);
router.get('/purchases', requireAdminAuth, getAllVideoPurchases);

export default router;
