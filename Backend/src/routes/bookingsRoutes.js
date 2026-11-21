import express from 'express';
import {
  createBooking,
  getAllRegistrations,
  toggleCheckIn,
  getBookingByRef
} from '../controllers/bookingsController.js';
import { requireAdminAuth } from '../middleware/authMiddleware.js';
import { bookingWriteLimiter, promoValidateLimiter } from '../middleware/securityMiddleware.js';

const router = express.Router();

// Public routes for student booking (rate-limited to prevent slot-exhaustion DoS & ref enumeration)
router.post('/', bookingWriteLimiter, createBooking);
router.get('/ref/:bookingRef', promoValidateLimiter, getBookingByRef);

// Protected Admin-Only routes
router.get('/registrations', requireAdminAuth, getAllRegistrations);
router.patch('/registrations/:id/checkin', requireAdminAuth, toggleCheckIn);

export default router;
