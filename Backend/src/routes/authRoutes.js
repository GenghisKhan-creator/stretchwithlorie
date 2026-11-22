import express from 'express';
import { createAdminToken, safeCompareStrings } from '../utils/token.js';
import { requireAdminAuth } from '../middleware/authMiddleware.js';
import { authLoginLimiter } from '../middleware/securityMiddleware.js';

const router = express.Router();

// POST /api/auth/login (Protected by strict brute-force rate limiter)
router.post('/login', authLoginLimiter, (req, res, next) => {
  try {
    const { password, remember = true } = req.body;
    const expectedPassword = process.env.ADMIN_PASSWORD;

    if (!expectedPassword) {
      console.error('[Security Error]: ADMIN_PASSWORD environment variable is not set.');
      return res.status(500).json({ success: false, error: 'Server authentication configuration error.' });
    }

    if (!password || typeof password !== 'string' || password.length > 256) {
      return res.status(400).json({ success: false, error: 'Valid password is required' });
    }

    if (!safeCompareStrings(password, expectedPassword)) {
      return res.status(401).json({ success: false, error: 'Incorrect admin password' });
    }

    // Ephemeral 1-day token if remember is false; 14-day persistent token if remember is true
    const expiresInDays = remember ? 14 : 1;
    const token = createAdminToken('admin', expiresInDays);
    res.json({
      success: true,
      message: 'Admin authentication successful',
      token,
      user: {
        role: 'admin',
        name: 'Lorie'
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/verify
router.get('/verify', requireAdminAuth, (req, res, next) => {
  try {
    res.json({
      success: true,
      valid: true,
      user: req.admin
    });
  } catch (err) {
    next(err);
  }
});

export default router;
