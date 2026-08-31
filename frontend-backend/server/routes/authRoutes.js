import express from 'express';
import mongoose from 'mongoose';
import UserModel from '../models/User.js';
import ActivityLogModel from '../models/ActivityLog.js';

const router = express.Router();

// Clean in-memory store for offline/local resilience (no demo dummy users)
let memoryUsers = [];
let memoryLogs = [];

const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@resumeranker.ai';
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const DEFAULT_ADMIN_NAME = process.env.ADMIN_NAME || 'Master Admin';

// Helper to log user activity
export const logActivity = async ({ userId, userName, userEmail, actionType, details, metadata = {} }) => {
  const logEntry = {
    user_name: userName,
    user_email: userEmail,
    action_type: actionType,
    details,
    metadata,
    timestamp: new Date(),
  };

  if (mongoose.connection.readyState === 1) {
    try {
      const log = new ActivityLogModel({
        user_id: userId && mongoose.Types.ObjectId.isValid(userId) ? userId : undefined,
        ...logEntry,
      });
      await log.save();
    } catch (e) {
      console.warn('[Activity Log] DB error:', e.message);
    }
  } else {
    memoryLogs.unshift({
      id: `log_${Date.now()}`,
      _id: `log_${Date.now()}`,
      ...logEntry,
      timestamp: new Date().toISOString(),
    });
  }
};

// POST /api/auth/register - Sign up a new HR Recruiter or Admin
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'hr', company = 'Talent Corp', department = 'Recruitment' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (mongoose.connection.readyState === 1) {
      const existingUser = await UserModel.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(400).json({ success: false, error: 'An account with this email already exists' });
      }

      const user = new UserModel({
        name,
        email: normalizedEmail,
        password, // In a real prod app, hash with bcrypt
        role,
        company,
        department,
        status: 'active',
        last_active: new Date(),
      });

      const savedUser = await user.save();
      
      await logActivity({
        userId: savedUser._id,
        userName: savedUser.name,
        userEmail: savedUser.email,
        actionType: 'LOGIN',
        details: `New account registered as ${role.toUpperCase()}`,
      });

      return res.status(201).json({
        success: true,
        data: {
          id: savedUser._id.toString(),
          name: savedUser.name,
          email: savedUser.email,
          role: savedUser.role,
          company: savedUser.company,
          department: savedUser.department,
          resumes_analyzed_count: savedUser.resumes_analyzed_count,
          emails_sent_count: savedUser.emails_sent_count,
        }
      });
    } else {
      const existing = memoryUsers.find(u => u.email.toLowerCase() === normalizedEmail);
      if (existing) {
        return res.status(400).json({ success: false, error: 'An account with this email already exists' });
      }

      const newUser = {
        id: `user_${Date.now()}`,
        _id: `user_${Date.now()}`,
        name,
        email: normalizedEmail,
        password,
        role,
        company,
        department,
        resumes_analyzed_count: 0,
        emails_sent_count: 0,
        status: 'active',
        last_active: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      memoryUsers.unshift(newUser);

      await logActivity({
        userName: newUser.name,
        userEmail: newUser.email,
        actionType: 'LOGIN',
        details: `New account registered as ${role.toUpperCase()}`,
      });

      return res.status(201).json({ success: true, data: newUser });
    }
  } catch (error) {
    console.error('[Auth API] Register Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/auth/admin-login - Dedicated Administrator Login
router.post('/admin-login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, error: 'Admin identifier (Email or ID) and password are required' });
    }

    const cleanId = identifier.trim().toLowerCase();

    // 1. Check Master Admin Credentials
    const isMasterAdminMatch = 
      (cleanId === DEFAULT_ADMIN_EMAIL.toLowerCase() || cleanId === 'admin' || cleanId === 'admin@resumeranker.ai') && 
      password === DEFAULT_ADMIN_PASSWORD;

    if (isMasterAdminMatch) {
      const adminData = {
        id: 'admin_master',
        name: DEFAULT_ADMIN_NAME,
        email: DEFAULT_ADMIN_EMAIL,
        role: 'admin',
        company: 'Executive HR Operations',
        department: 'Talent Platform Administration',
        status: 'active',
        last_active: new Date().toISOString()
      };

      await logActivity({
        userName: adminData.name,
        userEmail: adminData.email,
        actionType: 'LOGIN',
        details: 'Admin authenticated to executive control console'
      });

      return res.json({ success: true, data: adminData });
    }

    // 2. Check Database for any user with role: 'admin'
    if (mongoose.connection.readyState === 1) {
      const user = await UserModel.findOne({
        $or: [{ email: cleanId }, { name: { $regex: new RegExp(`^${cleanId}$`, 'i') } }],
        role: 'admin'
      });

      if (!user || user.password !== password) {
        return res.status(401).json({ success: false, error: 'Invalid admin credentials. Access restricted to authorized administrators.' });
      }

      if (user.status === 'inactive') {
        return res.status(403).json({ success: false, error: 'Admin account is currently disabled' });
      }

      user.last_active = new Date();
      await user.save();

      return res.json({
        success: true,
        data: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          company: user.company,
          department: user.department,
          status: user.status
        }
      });
    } else {
      const user = memoryUsers.find(u => 
        (u.email.toLowerCase() === cleanId || u.name.toLowerCase() === cleanId) && 
        u.role === 'admin'
      );

      if (!user || user.password !== password) {
        return res.status(401).json({ success: false, error: 'Invalid admin credentials. Access restricted to authorized administrators.' });
      }

      return res.json({ success: true, data: user });
    }
  } catch (error) {
    console.error('[Auth API] Admin Login Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/auth/login - Log in HR Recruiter or Admin
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if master admin is logging in via standard login form
    if ((normalizedEmail === DEFAULT_ADMIN_EMAIL.toLowerCase() || normalizedEmail === 'admin@resumeranker.ai') && password === DEFAULT_ADMIN_PASSWORD) {
      return res.json({
        success: true,
        data: {
          id: 'admin_master',
          name: DEFAULT_ADMIN_NAME,
          email: DEFAULT_ADMIN_EMAIL,
          role: 'admin',
          company: 'Executive HR Operations',
          department: 'Talent Platform Administration',
          status: 'active'
        }
      });
    }

    if (mongoose.connection.readyState === 1) {
      const user = await UserModel.findOne({ email: normalizedEmail });
      if (!user || user.password !== password) {
        return res.status(401).json({ success: false, error: 'Invalid email or password' });
      }

      if (user.status === 'inactive') {
        return res.status(403).json({ success: false, error: 'Your account has been deactivated by the Administrator' });
      }

      user.last_active = new Date();
      await user.save();

      await logActivity({
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
        actionType: 'LOGIN',
        details: `Logged into portal`,
      });

      return res.json({
        success: true,
        data: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          company: user.company,
          department: user.department,
          resumes_analyzed_count: user.resumes_analyzed_count,
          emails_sent_count: user.emails_sent_count,
        }
      });
    } else {
      const user = memoryUsers.find(u => u.email.toLowerCase() === normalizedEmail);
      if (!user || user.password !== password) {
        return res.status(401).json({ success: false, error: 'Invalid email or password' });
      }

      if (user.status === 'inactive') {
        return res.status(403).json({ success: false, error: 'Your account has been deactivated by the Administrator' });
      }

      user.last_active = new Date().toISOString();

      await logActivity({
        userName: user.name,
        userEmail: user.email,
        actionType: 'LOGIN',
        details: `Logged into portal`,
      });

      return res.json({ success: true, data: user });
    }
  } catch (error) {
    console.error('[Auth API] Login Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/auth/log-action - Record HR action (resume analysis, email send)
router.post('/log-action', async (req, res) => {
  try {
    const { userId, userName, userEmail, actionType, details, metadata = {} } = req.body;

    if (!userName || !actionType || !details) {
      return res.status(400).json({ success: false, error: 'Missing required activity fields' });
    }

    await logActivity({
      userId,
      userName,
      userEmail: userEmail || 'recruiter@resumeranker.ai',
      actionType,
      details,
      metadata,
    });

    // Update recruiter counters in database/memory
    if (actionType === 'RESUME_ANALYSIS' && metadata.resume_count) {
      if (mongoose.connection.readyState === 1 && userId && mongoose.Types.ObjectId.isValid(userId)) {
        await UserModel.findByIdAndUpdate(userId, {
          $inc: { resumes_analyzed_count: metadata.resume_count },
          last_active: new Date(),
        });
      } else {
        const u = memoryUsers.find(x => x.email === userEmail || x.id === userId);
        if (u) {
          u.resumes_analyzed_count = (u.resumes_analyzed_count || 0) + metadata.resume_count;
          u.last_active = new Date().toISOString();
        }
      }
    } else if (actionType === 'EMAIL_SENT') {
      if (mongoose.connection.readyState === 1 && userId && mongoose.Types.ObjectId.isValid(userId)) {
        await UserModel.findByIdAndUpdate(userId, {
          $inc: { emails_sent_count: 1 },
          last_active: new Date(),
        });
      } else {
        const u = memoryUsers.find(x => x.email === userEmail || x.id === userId);
        if (u) {
          u.emails_sent_count = (u.emails_sent_count || 0) + 1;
          u.last_active = new Date().toISOString();
        }
      }
    }

    return res.json({ success: true, message: 'Activity logged' });
  } catch (error) {
    console.error('[Auth API] Log Action Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export { memoryUsers, memoryLogs };
export default router;
