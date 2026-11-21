import express from 'express';
import {
  createEventInquiry,
  getAllEventInquiries,
  updateEventStatus
} from '../controllers/eventsController.js';
import { requireAdminAuth } from '../middleware/authMiddleware.js';
import { bookingWriteLimiter } from '../middleware/securityMiddleware.js';

const router = express.Router();

// Public: Guests submit celebration inquiries (rate-limited)
router.post('/', bookingWriteLimiter, createEventInquiry);

// Protected: Admin reviews and manages inquiries
router.get('/', requireAdminAuth, getAllEventInquiries);
router.patch('/:id/status', requireAdminAuth, updateEventStatus);

export default router;
