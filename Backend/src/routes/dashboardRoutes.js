import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { requireAdminAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected: Financial & attendee analytics
router.get('/stats', requireAdminAuth, getDashboardStats);

export default router;
