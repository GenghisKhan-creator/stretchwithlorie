import express from 'express';
import {
  validateReferralCode,
  getAllReferralCodes,
  createReferralCode,
  toggleReferralCodeStatus,
  deleteReferralCode
} from '../controllers/referralsController.js';
import { requireAdminAuth } from '../middleware/authMiddleware.js';
import { promoValidateLimiter } from '../middleware/securityMiddleware.js';

const router = express.Router();

// Public route: Students validate promo / creator referral code at checkout (rate-limited against code enumeration)
router.post('/validate', promoValidateLimiter, validateReferralCode);

// Protected Admin-Only routes: Generate & track creator collaborations and discounts
router.get('/', requireAdminAuth, getAllReferralCodes);
router.post('/', requireAdminAuth, createReferralCode);
router.patch('/:id/toggle', requireAdminAuth, toggleReferralCodeStatus);
router.delete('/:id', requireAdminAuth, deleteReferralCode);

export default router;
