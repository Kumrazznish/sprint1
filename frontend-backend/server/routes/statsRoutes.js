import express from 'express';
import mongoose from 'mongoose';
import { CandidateModel } from '../models/Candidate.js';

const router = express.Router();

// GET /api/stats - Compute hiring statistics
router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const candidateCount = await CandidateModel.countDocuments();
      if (candidateCount === 0) {
        return res.json({
          success: true,
          data: {
            totalCandidates: 0,
            relevantCandidates: 0,
            averageScore: 0,
            topCandidates: 0,
            averageExperience: 0,
            averageHireProbability: 0,
            matchRate: 0,
          }
        });
      }

      const stats = await CandidateModel.aggregate([
        {
          $group: {
            _id: null,
            totalCandidates: { $sum: 1 },
            relevantCandidates: {
              $sum: { $cond: [{ $eq: ['$is_relevant', true] }, 1, 0] }
            },
            averageScore: { $avg: '$match_score' },
            topCandidates: {
              $sum: { $cond: [{ $gte: ['$match_score', 80] }, 1, 0] }
            },
            averageExperience: { $avg: '$experience_years' },
            averageHireProbability: { $avg: '$hire_probability' }
          }
        }
      ]);

      const result = stats[0] || {};
      const total = result.totalCandidates || 0;
      const relevant = result.relevantCandidates || 0;

      return res.json({
        success: true,
        data: {
          totalCandidates: total,
          relevantCandidates: relevant,
          averageScore: Math.round(result.averageScore || 0),
          topCandidates: result.topCandidates || 0,
          averageExperience: Math.round(result.averageExperience || 0),
          averageHireProbability: Math.round((result.averageHireProbability || 0) * 100),
          matchRate: total > 0 ? Math.round((relevant / total) * 100) : 0,
        }
      });
    } else {
      return res.json({
        success: true,
        data: {
          totalCandidates: 0,
          relevantCandidates: 0,
          averageScore: 0,
          topCandidates: 0,
          averageExperience: 0,
          averageHireProbability: 0,
          matchRate: 0,
        }
      });
    }
  } catch (error) {
    console.error('[Stats API] Aggregation Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
