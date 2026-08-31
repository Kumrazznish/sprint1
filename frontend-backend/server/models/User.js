import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  role: {
    type: String,
    enum: ['admin', 'hr', 'recruiter'],
    default: 'hr',
  },
  company: {
    type: String,
    default: 'Talent Acquisition Inc.',
  },
  department: {
    type: String,
    default: 'Human Resources',
  },
  resumes_analyzed_count: {
    type: Number,
    default: 0,
  },
  emails_sent_count: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  last_active: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id.toString(); delete ret.password; delete ret.__v; return ret; } }
});

UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

export const UserModel = mongoose.model('User', UserSchema);
export default UserModel;
