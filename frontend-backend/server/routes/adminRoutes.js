import express from 'express';
import mongoose from 'mongoose';
import UserModel from '../models/User.js';
import ActivityLogModel from '../models/ActivityLog.js';
import AnalysisResult from '../models/AnalysisResult.js';
import ApiKey from '../models/ApiKey.js';
import { KeyPoolManager } from '../services/KeyPoolManager.js';
import { memoryUsers, memoryLogs } from './authRoutes.js';

const router = express.Router();

// Auto-seed initial recruiters if none exist in MongoDB
const seedInitialRecruitersIfEmpty = async () => {
  if (mongoose.connection.readyState !== 1) return;
  try {
    const count = await UserModel.countDocuments({ role: { $ne: 'admin' } });
    if (count === 0) {
      console.log('[Admin API] Seeding initial recruiter accounts...');
      await UserModel.insertMany([
        {
          name: 'Rajnish Kumar',
          email: 'rajnish@kumrazz.com',
          password: 'password123',
          role: 'recruiter',
          company: 'Kumrazz Talent Solutions',
          department: 'Technical Recruitment',
          status: 'active',
          resumes_analyzed_count: 14,
          emails_sent_count: 5,
          last_active: new Date()
        },
        {
          name: 'Sarah Miller',
          email: 'sarah.m@talentcorp.com',
          password: 'password123',
          role: 'hr',
          company: 'Talent Corp Global',
          department: 'Executive Search',
          status: 'active',
          resumes_analyzed_count: 8,
          emails_sent_count: 3,
          last_active: new Date()
        }
      ]);

      const logCount = await ActivityLogModel.countDocuments();
      if (logCount === 0) {
        await ActivityLogModel.insertMany([
          {
            user_name: 'Rajnish Kumar',
            user_email: 'rajnish@kumrazz.com',
            action_type: 'RESUME_ANALYSIS',
            details: 'Analyzed 5 candidate resumes for Senior Full Stack Engineer',
            metadata: { resume_count: 5, score: 88 },
            timestamp: new Date()
          },
          {
            user_name: 'Sarah Miller',
            user_email: 'sarah.m@talentcorp.com',
            action_type: 'LOGIN',
            details: 'Logged into Recruiter Workspace',
            metadata: {},
            timestamp: new Date(Date.now() - 3600000)
          }
        ]);
      }
    }
  } catch (e) {
    console.warn('[Admin API] Seed notice:', e.message);
  }
};

// GET /api/admin/overview - High level KPIs for Admin Dashboard
router.get('/overview', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await seedInitialRecruitersIfEmpty();

      const totalHrs = await UserModel.countDocuments({ role: { $ne: 'admin' } });
      const activeHrs = await UserModel.countDocuments({ status: 'active', role: { $ne: 'admin' } });

      const hrStats = await UserModel.aggregate([
        { $match: { role: { $ne: 'admin' } } },
        {
          $group: {
            _id: null,
            totalResumesAnalyzed: { $sum: '$resumes_analyzed_count' },
            totalEmailsSent: { $sum: '$emails_sent_count' }
          }
        }
      ]);

      const analysisStats = await AnalysisResult.aggregate([
        {
          $group: {
            _id: null,
            totalBatches: { $sum: 1 },
            avgScore: { $avg: '$average_score' },
            totalCandidatesEvaluated: { $sum: '$total_candidates' }
          }
        }
      ]);

      const totalResumes = hrStats[0]?.totalResumesAnalyzed || analysisStats[0]?.totalCandidatesEvaluated || 0;
      const totalEmails = hrStats[0]?.totalEmailsSent || 0;
      const avgMatch = Math.round(analysisStats[0]?.avgScore || 0);
      const totalHiringSessions = analysisStats[0]?.totalBatches || 0;

      return res.json({
        success: true,
        data: {
          totalHrs: totalHrs || memoryUsers.filter(u => u.role !== 'admin').length,
          activeHrs: activeHrs || memoryUsers.filter(u => u.role !== 'admin' && u.status === 'active').length,
          totalResumesAnalyzed: totalResumes,
          totalEmailsSent: totalEmails,
          avgCandidateMatchScore: avgMatch,
          totalHiringSessions: totalHiringSessions,
        }
      });
    } else {
      const hrs = memoryUsers.filter(u => u.role !== 'admin');
      const totalResumes = hrs.reduce((s, u) => s + (u.resumes_analyzed_count || 0), 0);
      const totalEmails = hrs.reduce((s, u) => s + (u.emails_sent_count || 0), 0);

      return res.json({
        success: true,
        data: {
          totalHrs: hrs.length,
          activeHrs: hrs.filter(u => u.status === 'active').length,
          totalResumesAnalyzed: totalResumes,
          totalEmailsSent: totalEmails,
          avgCandidateMatchScore: 0,
          totalHiringSessions: 0,
        }
      });
    }
  } catch (error) {
    console.error('[Admin API] Overview Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/admin/hrs - List all HR Recruiters with their statistics
router.get('/hrs', async (req, res) => {
  try {
    const { search, status } = req.query;

    if (mongoose.connection.readyState === 1) {
      await seedInitialRecruitersIfEmpty();

      let filter = { role: { $ne: 'admin' } };
      if (status && status !== 'all') filter.status = status;
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { company: { $regex: search, $options: 'i' } }
        ];
      }

      const users = await UserModel.find(filter).sort({ resumes_analyzed_count: -1, createdAt: -1 });
      return res.json({ success: true, data: users });
    } else {
      let hrs = memoryUsers.filter(u => u.role !== 'admin');
      if (status && status !== 'all') hrs = hrs.filter(u => u.status === status);
      if (search) {
        const s = String(search).toLowerCase();
        hrs = hrs.filter(u =>
          u.name.toLowerCase().includes(s) ||
          u.email.toLowerCase().includes(s) ||
          u.company?.toLowerCase().includes(s)
        );
      }
      hrs.sort((a, b) => (b.resumes_analyzed_count || 0) - (a.resumes_analyzed_count || 0));
      return res.json({ success: true, data: hrs });
    }
  } catch (error) {
    console.error('[Admin API] HRs Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/admin/activity-logs - Live activity logs across HR operations
router.get('/activity-logs', async (req, res) => {
  try {
    const { limit = 25 } = req.query;

    if (mongoose.connection.readyState === 1) {
      const logs = await ActivityLogModel.find()
        .sort({ createdAt: -1 })
        .limit(Number(limit));
      return res.json({ success: true, data: logs });
    } else {
      return res.json({ success: true, data: memoryLogs.slice(0, Number(limit)) });
    }
  } catch (error) {
    console.error('[Admin API] Activity Logs Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/admin/toggle-status/:id - Activate or Deactivate an HR account
router.patch('/toggle-status/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      const user = await UserModel.findById(id);
      if (!user) return res.status(404).json({ success: false, error: 'User not found' });

      user.status = user.status === 'active' ? 'inactive' : 'active';
      await user.save();

      return res.json({ success: true, data: user, message: `HR account is now ${user.status}` });
    } else {
      const user = memoryUsers.find(u => u.id === id || u._id === id);
      if (!user) return res.status(404).json({ success: false, error: 'User not found' });

      user.status = user.status === 'active' ? 'inactive' : 'active';
      return res.json({ success: true, data: user, message: `HR account is now ${user.status}` });
    }
  } catch (error) {
    console.error('[Admin API] Toggle Status Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/admin/key-pool/status
router.get('/key-pool/status', async (req, res) => {
  try {
    if (!KeyPoolManager.isInitialized) {
      await KeyPoolManager.initialize();
    }
    const snapshot = KeyPoolManager.getLiveStatusSnapshot();
    const slots = snapshot.slots || [];
    const events = snapshot.events || [];

    const totalSlots = slots.length;
    const activeSlots = slots.filter(s => s.isActive).length;
    const occupiedSlots = slots.filter(s => s.isOccupied).length;
    const healthySlots = slots.filter(s => s.healthScore > 50 && s.isActive).length;
    const currentTotalRPM = slots.reduce((sum, s) => sum + s.currentRPM, 0);
    const totalTokensTracked = slots.reduce((sum, s) => sum + s.totalTokensUsed, 0);

    res.json({
      success: true,
      data: {
        summary: {
          totalSlots,
          activeSlots,
          occupiedSlots,
          healthySlots,
          currentTotalRPM,
          totalTokensTracked
        },
        slots,
        events
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/key-pool/keys
router.post('/key-pool/keys', async (req, res) => {
  try {
    const { apiKey, name, provider, rateLimit, softLimit } = req.body;
    if (!apiKey || apiKey.trim().length < 8) {
      return res.status(400).json({ success: false, error: 'Valid API key is required' });
    }

    const slot = await KeyPoolManager.addKey({
      apiKey,
      name,
      provider: provider || 'gemini',
      rateLimit: rateLimit ? Number(rateLimit) : 15,
      softLimit: softLimit ? Number(softLimit) : 12
    });

    res.status(201).json({
      success: true,
      message: 'API Key successfully registered in pool',
      data: {
        id: slot.id,
        name: slot.name,
        maskedKey: slot.maskedKey,
        healthScore: slot.healthScore,
        rateLimit: slot.rateLimit
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/admin/key-pool/keys/:id/toggle
router.patch('/key-pool/keys/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const newState = KeyPoolManager.toggleKey(id, isActive);
    await ApiKey.findByIdAndUpdate(id, { isActive: newState }).catch(() => null);

    res.json({
      success: true,
      message: `API Key ${newState ? 'enabled' : 'disabled'}`,
      data: { id, isActive: newState }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/key-pool/keys/:id/reset
router.post('/key-pool/keys/:id/reset', async (req, res) => {
  try {
    const { id } = req.params;
    const success = KeyPoolManager.resetSlotHealth(id);
    if (success) {
      await ApiKey.findByIdAndUpdate(id, {
        healthScore: 100,
        isOccupied: false,
        occupiedBy: null
      }).catch(() => null);
      return res.json({ success: true, message: 'Key slot health and cooldowns reset' });
    }
    res.status(404).json({ success: false, error: 'Key slot not found' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/admin/key-pool/keys/:id
router.delete('/key-pool/keys/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await KeyPoolManager.removeKey(id);
    res.json({ success: true, message: 'API Key deleted from pool' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
