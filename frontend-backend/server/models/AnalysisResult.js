import mongoose from 'mongoose';
import { CandidateSchema } from './Candidate.js';

const AnalysisResultSchema = new mongoose.Schema({
  job_description_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobDescription',
    required: false,
  },
  candidates: [CandidateSchema],
  total_candidates: {
    type: Number,
    required: true,
    min: 0,
  },
  relevant_candidates: {
    type: Number,
    required: true,
    min: 0,
  },
  average_score: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  top_candidates: {
    type: Number,
    required: true,
    min: 0,
  },
  processing_time: {
    type: Number,
    default: 0,
  },
  analysis_date: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id.toString(); delete ret.__v; return ret; } }
});

AnalysisResultSchema.index({ createdAt: -1 });

export const AnalysisResultModel = mongoose.model('AnalysisResult', AnalysisResultSchema);
export default AnalysisResultModel;
