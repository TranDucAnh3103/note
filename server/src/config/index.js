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
  ai: {
    grokApiKey: process.env.GROK_API_KEY,
    grokBaseUrl: process.env.GROK_BASE_URL || 'https://api.xkiro.com/v1',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '1843465297-bbnnggqpe1s5r82gtvi2h0kli7fves7c.apps.googleusercontent.com'
  },
  supabase: {
    host: process.env.SUPABASE_HOST,
    port: process.env.SUPABASE_PORT || 5432,
    database: process.env.SUPABASE_DB || 'postgres',
    user: process.env.SUPABASE_USER || 'postgres',
    password: process.env.SUPABASE_PASSWORD,
  },
  openrouter: {
    embedKey: process.env.OPENROUTER_EMBED_KEY,
    embedModel: process.env.OPENROUTER_EMBED_MODEL || 'nvidia/nemotron-3-embed-1b:free',
  }
};
