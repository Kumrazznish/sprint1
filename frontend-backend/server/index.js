import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import keyPoolRoutes from './routes/keyPoolRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import candidateRoutes from './routes/candidateRoutes.js';
import analysisRoutes from './routes/analysisRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import { KeyPoolManager } from './services/KeyPoolManager.js';
import { KeyPoolDaemons } from './services/KeyPoolDaemons.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const IS_VERCEL = process.env.VERCEL === '1' || process.env.VERCEL_ENV !== undefined;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure DB is connected before handling API requests (critical for Vercel serverless)
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (e) {
    // Continue even if DB is unavailable — routes have in-memory fallbacks
  }
  next();
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const mongoose = await import('mongoose');
  res.json({
    status: 'online',
    database: mongoose.default.connection.readyState === 1 ? 'MongoDB Connected' : 'In-Memory Fallback',
    environment: IS_VERCEL ? 'vercel' : 'local',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/key-pool', keyPoolRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/stats', statsRoutes);

// 404 handler for undefined API routes
app.use((req, res) => {
  res.status(404).json({ success: false, error: `API route ${req.originalUrl} not found` });
});

// Only start persistent server in local dev (NOT on Vercel — it handles requests directly)
if (!IS_VERCEL) {
  app.listen(PORT, async () => {
    console.log(`[ResumeRanker Server] Running on http://localhost:${PORT}`);
    console.log(`[ResumeRanker Server] Database: MongoDB (Mongoose ODM)`);
    await connectDB();
    await KeyPoolManager.initialize().catch(err => console.error('[Server Boot] Key pool init error:', err));
    KeyPoolDaemons.startDaemons();
  });
} else {
  // On Vercel: initialize key pool once per cold start (no daemons)
  KeyPoolManager.initialize().catch(err => console.error('[Vercel Boot] Key pool init error:', err));
}

export default app;
