import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  user_name: {
    type: String,
    required: true,
  },
  user_email: {
    type: String,
    required: true,
  },
  action_type: {
    type: String,
    enum: ['RESUME_ANALYSIS', 'EMAIL_SENT', 'JOB_CREATED', 'CANDIDATE_EXPORT', 'LOGIN'],
    required: true,
  },
  details: {
    type: String,
    required: true,
  },
  metadata: {
    job_title: String,
    resume_count: Number,
    recipient_email: String,
    candidate_name: String,
    score: Number,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id.toString(); delete ret.__v; return ret; } }
});

ActivityLogSchema.index({ createdAt: -1 });
ActivityLogSchema.index({ user_email: 1 });

export const ActivityLogModel = mongoose.model('ActivityLog', ActivityLogSchema);
export default ActivityLogModel;
