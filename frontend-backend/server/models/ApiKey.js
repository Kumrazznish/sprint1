import mongoose from 'mongoose';

const modelStatusSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['HEALTHY', 'RATE_LIMITED', 'DAILY_QUOTA_EXHAUSTED', 'DISABLED'],
    default: 'HEALTHY'
  },
  resetsAt: {
    type: Date,
    default: null
  },
  failureCount: {
    type: Number,
    default: 0
  },
  lastUsedAt: {
    type: Date,
    default: null
  }
}, { _id: false });

const apiKeySchema = new mongoose.Schema({
  apiKey: {
    type: String,
    required: [true, 'API Key is required'],
    unique: true,
    trim: true,
    select: false // Protected by default
  },
  maskedKey: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: [true, 'Key identifier name is required'],
    trim: true
  },
  provider: {
    type: String,
    enum: ['gemini', 'openai', 'anthropic'],
    default: 'gemini'
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  healthScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 100,
    index: true
  },
  queuePosition: {
    type: Number,
    default: 0,
    index: true
  },
  rateLimit: {
    type: Number,
    default: 15, // Requests Per Minute (RPM)
    min: 1
  },
  softLimit: {
    type: Number,
    default: 12 // Pre-emptive threshold
  },
  requestsThisMinute: {
    type: Number,
    default: 0
  },
  isOccupied: {
    type: Boolean,
    default: false,
    index: true
  },
  occupiedBy: {
    type: String,
    default: null
  },
  occupiedSince: {
    type: Date,
    default: null
  },
  activeModel: {
    type: String,
    default: 'gemini-2.5-flash'
  },
  modelStatuses: {
    type: mongoose.Schema.Types.Mixed,
    default: () => ({
      'gemini-2.5-flash': { status: 'HEALTHY', failureCount: 0 },
      'gemini-2.0-flash': { status: 'HEALTHY', failureCount: 0 },
      'gemini-1.5-flash': { status: 'HEALTHY', failureCount: 0 },
      'gemini-1.5-pro': { status: 'HEALTHY', failureCount: 0 }
    })
  },
  totalRequests: {
    type: Number,
    default: 0
  },
  successfulRequests: {
    type: Number,
    default: 0
  },
  failedRequests: {
    type: Number,
    default: 0
  },
  totalTokensUsed: {
    type: Number,
    default: 0
  },
  avgLatencyMs: {
    type: Number,
    default: 0
  },
  lastUsedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Performance compound index for zero-latency query on cold starts & fallback
apiKeySchema.index({ isActive: 1, queuePosition: 1, healthScore: -1, isOccupied: 1 });

// Helper to mask key for safe UI inspection
apiKeySchema.statics.maskKey = function(key) {
  if (!key || key.length < 8) return 'AIza...****';
  return `${key.substring(0, 6)}...${key.substring(key.length - 4)}`;
};

const ApiKey = mongoose.model('ApiKey', apiKeySchema);

export default ApiKey;
