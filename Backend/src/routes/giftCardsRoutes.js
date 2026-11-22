import express from 'express';
import {
  createGiftCard,
  getGiftCardByCode,
  redeemGiftCard,
  deskWalkInBooking,
  adjustCard,
  voidCard,
  getAllGiftCards
} from '../controllers/giftCardsController.js';
import { requireAdminAuth } from '../middleware/authMiddleware.js';
import { bookingWriteLimiter, promoValidateLimiter } from '../middleware/securityMiddleware.js';

const router = express.Router();

// Collection & Management routes (Admin protected)
router.get('/', requireAdminAuth, getAllGiftCards);
router.patch('/:id/adjust', requireAdminAuth, adjustCard);
router.patch('/:id/void', requireAdminAuth, voidCard);

// Public creation
router.post('/', bookingWriteLimiter, createGiftCard);

// Desk walk-in booking (Admin protected)
router.post('/:code/walk-in', requireAdminAuth, deskWalkInBooking);

// Public: Check and redeem individual cards (rate-limited against enumeration & spam)
router.get('/:code', promoValidateLimiter, getGiftCardByCode);
router.post('/:code/redeem', promoValidateLimiter, redeemGiftCard);

export default router;
