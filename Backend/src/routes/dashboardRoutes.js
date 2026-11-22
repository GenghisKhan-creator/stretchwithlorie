import express from 'express';
import { getDashboardStats, getAllTransactions, purgeTestData } from '../controllers/dashboardController.js';
import { requireAdminAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected: Financial & attendee analytics
router.get('/stats', requireAdminAuth, getDashboardStats);

// Protected: Master financial transactions ledger
router.get('/transactions', requireAdminAuth, getAllTransactions);

// Protected: Purge test data (Dev testing control — preserves admin auth)
router.post('/purge-test-data', requireAdminAuth, purgeTestData);

export default router;
