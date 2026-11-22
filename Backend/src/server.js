import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { testConnection, pool } from './config/db.js';
import { initWebSocketServer } from './websocket.js';

import classesRoutes from './routes/classesRoutes.js';
import bookingsRoutes from './routes/bookingsRoutes.js';
import videosRoutes from './routes/videosRoutes.js';
import eventsRoutes from './routes/eventsRoutes.js';
import giftCardsRoutes from './routes/giftCardsRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import authRoutes from './routes/authRoutes.js';
import referralsRoutes from './routes/referralsRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import {
  securityHeaders,
  globalApiLimiter,
  redactUrlForLogging
} from './middleware/securityMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Hide Express server fingerprint
app.disable('x-powered-by');

// Defensive HTTP Security Headers
app.use(securityHeaders);

// CORS Policy
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowed =
        origin === CLIENT_URL ||
        origin === CLIENT_URL?.replace(/\/$/, '') ||
        origin === 'http://localhost:5173' ||
        origin === 'http://127.0.0.1:5173' ||
        origin.endsWith('.onrender.com') ||
        origin.endsWith('.vercel.app');

      if (isAllowed) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  })
);

// Strict Body Payload Size Limits (Anti-DoS Memory Exhaustion)
app.use(express.json({ limit: '25kb' }));
app.use(express.urlencoded({ extended: true, limit: '25kb' }));

// Safe HTTP Request Logging (Redacts any query tokens/keys & skips noisy health polls)
morgan.token('safe-url', (req) => redactUrlForLogging(req.originalUrl || req.url));
app.use(
  morgan(':method :safe-url :status :response-time ms - :res[content-length]', {
    skip: (req) => req.path === '/api/health'
  })
);

// Global IP Rate Limiter (Anti-DDoS)
app.use('/api', globalApiLimiter);

// API Routes
app.use('/api/classes', classesRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/videos', videosRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/gift-cards', giftCardsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/referrals', referralsRoutes);

// Health Check Endpoint (Silent DB check to prevent log flooding)
app.get('/api/health', async (req, res) => {
  const isDbConnected = await testConnection(true);
  res.json({
    status: 'ok',
    service: 'stretchwithlorie-backend',
    database: isDbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Root welcome
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Stretch With Lorie Yoga Platform API',
    version: '1.0.0'
  });
});

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route not found: ${redactUrlForLogging(req.originalUrl)}` });
});

// Global Error Handler
app.use(errorHandler);

// Start Server & WebSocket Listener
const server = http.createServer(app);
initWebSocketServer(server);

server.listen(PORT, async () => {
  console.log(`====================================================`);
  console.log(`🚀 Stretch With Lorie Backend Server running on port ${PORT}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`⚡ WebSocket Server: ws://localhost:${PORT}/ws`);
  console.log(`🌐 Allowed Client: ${CLIENT_URL}`);
  console.log(`====================================================`);

  // Check database connection on boot
  await testConnection(false);
});

// Graceful Shutdown
process.on('SIGINT', async () => {
  console.log('\n[Server] Gracefully shutting down...');
  await pool.end();
  process.exit(0);
});

export default app;
