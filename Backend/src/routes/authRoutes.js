import express from 'express';
import { createAdminToken, safeCompareStrings } from '../utils/token.js';
import { requireAdminAuth } from '../middleware/authMiddleware.js';
import { authLoginLimiter } from '../middleware/securityMiddleware.js';

const router = express.Router();

// POST /api/auth/login (Protected by strict brute-force rate limiter)
router.post('/login', authLoginLimiter, (req, res) => {
  const { password } = req.body;
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

  const token = createAdminToken('admin', 7);
  res.json({
    success: true,
    message: 'Admin authentication successful',
    token,
    user: {
      role: 'admin',
      name: 'Lorie'
    }
  });
});

// GET /api/auth/verify
router.get('/verify', requireAdminAuth, (req, res) => {
  res.json({
    success: true,
    valid: true,
    user: req.admin
  });
});

export default router;
