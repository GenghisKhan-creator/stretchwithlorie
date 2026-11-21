import express from 'express';
import {
  createGiftCard,
  getGiftCardByCode,
  redeemGiftCard,
  getAllGiftCards
} from '../controllers/giftCardsController.js';
import { requireAdminAuth } from '../middleware/authMiddleware.js';
import { bookingWriteLimiter, promoValidateLimiter } from '../middleware/securityMiddleware.js';

const router = express.Router();

// Public: Buy, check, and redeem gift cards (rate-limited against enumeration & spam)
router.post('/', bookingWriteLimiter, createGiftCard);
router.get('/:code', promoValidateLimiter, getGiftCardByCode);
router.post('/:code/redeem', promoValidateLimiter, redeemGiftCard);

// Protected: Admin views all issued gift cards
router.get('/', requireAdminAuth, getAllGiftCards);

export default router;
