import express from 'express';
import mongoose from 'mongoose';
import { CandidateModel } from '../models/Candidate.js';

const router = express.Router();
let memoryCandidates = [];

// POST /api/candidates - Batch insert or create candidates
router.post('/', async (req, res) => {
  try {
    const candidatesData = Array.isArray(req.body) ? req.body : [req.body];
    
    if (mongoose.connection.readyState === 1) {
      const inserted = await CandidateModel.insertMany(candidatesData);
      return res.status(201).json({ success: true, data: inserted });
    } else {
      const inserted = candidatesData.map((c, i) => ({
        ...c,
        id: `cand_${Date.now()}_${i}`,
        _id: `cand_${Date.now()}_${i}`,
        createdAt: new Date().toISOString(),
      }));
      memoryCandidates = [...inserted, ...memoryCandidates];
      return res.status(201).json({ success: true, data: inserted });
    }
  } catch (error) {
    console.error('[Candidates API] Create Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/candidates - Query candidates with sorting & filters
router.get('/', async (req, res) => {
  try {
    const { query, experience_level, min_score, is_relevant, limit = 100, offset = 0 } = req.query;

    if (mongoose.connection.readyState === 1) {
      let filter = {};
      if (query) {
        filter.$or = [
          { candidate_name: { $regex: query, $options: 'i' } },
          { summary: { $regex: query, $options: 'i' } },
        ];
      }
      if (experience_level) filter.experience_level = experience_level;
      if (min_score) filter.match_score = { $gte: Number(min_score) };
      if (is_relevant !== undefined) filter.is_relevant = is_relevant === 'true';

      const candidates = await CandidateModel.find(filter)
        .sort({ match_score: -1, createdAt: -1 })
        .skip(Number(offset))
        .limit(Number(limit));

      return res.json({ success: true, data: candidates });
    } else {
      let result = [...memoryCandidates];
      if (query) {
        const q = String(query).toLowerCase();
        result = result.filter(c => c.candidate_name?.toLowerCase().includes(q) || c.summary?.toLowerCase().includes(q));
      }
      if (min_score) {
        result = result.filter(c => c.match_score >= Number(min_score));
      }
      if (is_relevant !== undefined) {
        result = result.filter(c => String(c.is_relevant) === String(is_relevant));
      }
      result.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
      return res.json({ success: true, data: result.slice(Number(offset), Number(offset) + Number(limit)) });
    }
  } catch (error) {
    console.error('[Candidates API] Query Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
