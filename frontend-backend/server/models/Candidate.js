import mongoose from 'mongoose';

export const CandidateSchema = new mongoose.Schema({
  job_description_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobDescription',
    required: false,
  },
  candidate_name: {
    type: String,
    required: [true, 'Candidate name is required'],
    trim: true,
  },
  contact_info: {
    email: { type: String, default: 'Not specified' },
    phone: { type: String, default: 'Not specified' },
  },
  skills: [{ type: String, trim: true }],
  experience_years: { type: Number, default: 0, min: 0 },
  education: { type: String, default: 'Not specified' },
  certifications: [{ type: String }],
  notable_companies: [{ type: String }],
  summary: { type: String, required: true },
  matched_skills: [{ type: String }],
  missing_skills: [{ type: String }],
  match_score: { type: Number, required: true, min: 0, max: 100 },
  recommendation: { type: String, required: true },
  is_relevant: { type: Boolean, default: false },
  issues_detected: [{ type: String }],
  strengths: [{ type: String }],
  weaknesses: [{ type: String }],
  interview_questions: [{ type: String }],
  salary_range: { type: String, default: 'Not specified' },
  hire_probability: { type: Number, min: 0, max: 1, default: 0.5 },
  experience_level: { type: String, default: 'Mid' },
  skill_diversity: { type: Number, default: 0 },
  company_prestige: { type: Number, default: 0 },
}, {
  timestamps: true,
  toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id.toString(); delete ret.__v; return ret; } }
});

CandidateSchema.index({ match_score: -1 });
CandidateSchema.index({ is_relevant: 1 });
CandidateSchema.index({ candidate_name: 'text', summary: 'text' });

export const CandidateModel = mongoose.model('Candidate', CandidateSchema);
export default CandidateModel;
