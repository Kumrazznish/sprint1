import express from 'express';
import mongoose from 'mongoose';
import JobDescription from '../models/JobDescription.js';

const router = express.Router();
let memoryJobs = [];

// POST /api/jobs - Create a new Job Description
router.post('/', async (req, res) => {
  try {
    const { title, description, required_skills, experience_level, salary_range } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ success: false, error: 'Title and description are required' });
    }

    if (mongoose.connection.readyState === 1) {
      const job = new JobDescription({
        title,
        description,
        required_skills: Array.isArray(required_skills) ? required_skills : [],
        experience_level: experience_level || 'Mid',
        salary_range: salary_range || 'Not specified',
      });
      const saved = await job.save();
      return res.status(201).json({ success: true, data: saved });
    } else {
      const job = {
        id: `job_${Date.now()}`,
        _id: `job_${Date.now()}`,
        title,
        description,
        required_skills: Array.isArray(required_skills) ? required_skills : [],
        experience_level: experience_level || 'Mid',
        salary_range: salary_range || 'Not specified',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      memoryJobs.unshift(job);
      return res.status(201).json({ success: true, data: job });
    }
  } catch (error) {
    console.error('[Jobs API] Create Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/jobs - Fetch all Job Descriptions
router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const jobs = await JobDescription.find().sort({ createdAt: -1 }).limit(50);
      return res.json({ success: true, data: jobs });
    } else {
      return res.json({ success: true, data: memoryJobs });
    }
  } catch (error) {
    console.error('[Jobs API] Fetch Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/jobs/:id - Fetch single Job Description
router.get('/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const job = await JobDescription.findById(req.params.id);
      if (!job) return res.status(404).json({ success: false, error: 'Job description not found' });
      return res.json({ success: true, data: job });
    } else {
      const job = memoryJobs.find(j => j.id === req.params.id || j._id === req.params.id);
      if (!job) return res.status(404).json({ success: false, error: 'Job description not found' });
      return res.json({ success: true, data: job });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
