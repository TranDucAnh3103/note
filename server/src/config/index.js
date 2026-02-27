// Environment variables are loaded in index.js entry point
// This file only exports configuration values

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET || 'default-secret-key',
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
  rateLimit: {
    windowMs: 1 * 60 * 1000, // 1 phút
    max: 200, // 200 requests/phút - đủ cho CRUD bình thường
  },
};
