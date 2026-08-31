import mongoose from 'mongoose';

const JobDescriptionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Job description text is required'],
  },
  required_skills: [{
    type: String,
    trim: true,
  }],
  experience_level: {
    type: String,
    enum: ['Entry', 'Junior', 'Mid', 'Senior', 'Lead', 'Executive'],
    default: 'Mid',
  },
  salary_range: {
    type: String,
    default: 'Not specified',
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id.toString(); delete ret.__v; return ret; } }
});

JobDescriptionSchema.index({ title: 'text', description: 'text' });

export const JobDescriptionModel = mongoose.model('JobDescription', JobDescriptionSchema);
export default JobDescriptionModel;
