import mongoose from 'mongoose';

// Cache the connection across serverless function invocations
let cachedConnection = null;

export const connectDB = async () => {
  // Return existing connected instance immediately (critical for Vercel serverless)
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  let mongoURI = process.env.MONGODB_URI || '';

  // Fix malformed URI (legacy double-key format)
  if (mongoURI.includes('MONGO_URI=')) {
    mongoURI = mongoURI.replace(/MONGO_URI=/g, '');
  }
  mongoURI = mongoURI.trim();

  if (!mongoURI || mongoURI === 'mongodb://127.0.0.1:27017/resumeranker') {
    console.warn('[MongoDB] No MONGODB_URI set — running in memory-only mode');
    return null;
  }

  try {
    cachedConnection = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 30000,
      maxPoolSize: 5,       // Keep pool small for serverless
      minPoolSize: 1,
      bufferCommands: false,
    });
    console.log(`[MongoDB] Connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
    return cachedConnection;
  } catch (error) {
    cachedConnection = null;
    console.warn(`[MongoDB] Connection failed: ${error.message}`);
    console.log('[MongoDB] Falling back to in-memory mode');
    return null;
  }
};

export const getDBStatus = () => mongoose.connection.readyState === 1;

export default connectDB;
