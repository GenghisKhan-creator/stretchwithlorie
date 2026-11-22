import { verifyAdminToken, safeCompareStrings } from '../utils/token.js';

export function requireAdminAuth(req, res, next) {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Check 1: Master Admin Key header (constant-time comparison)
    const adminKey = req.headers['x-admin-key'];
    if (adminKey && adminPassword && safeCompareStrings(String(adminKey), String(adminPassword))) {
      req.admin = { role: 'admin', name: 'Lorie' };
      return next();
    }

    // Check 2: Bearer Token in Authorization header (URL query tokens disallowed to prevent log leakage)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      const payload = verifyAdminToken(token);
      if (payload) {
        req.admin = payload;
        return next();
      }
    }

    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Admin access required. Please log in with the admin password.'
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Authentication failed. Please log in again.'
    });
  }
}
