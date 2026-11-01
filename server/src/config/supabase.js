const { Pool } = require('pg');
const config = require('./index');

const pool = new Pool({
  host: config.supabase.host,
  port: config.supabase.port,
  database: config.supabase.database,
  user: config.supabase.user,
  password: config.supabase.password,
  ssl: { rejectUnauthorized: false }
});

// Initialize vector extension and table if not exists
const initDb = async () => {
  if (!config.supabase.host) {
    console.log('⚠️ Supabase host not configured, skipping vector DB initialization.');
    return;
  }
  
  try {
    const client = await pool.connect();
    console.log('📦 Connected to Supabase PostgreSQL');
    
    await client.query('CREATE EXTENSION IF NOT EXISTS vector');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS note_embeddings (
        id BIGSERIAL PRIMARY KEY,
        note_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        content_chunk TEXT,
        embedding VECTOR(2048),
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    
    // Create indexes if they don't exist
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_note_embeddings_user_id ON note_embeddings (user_id);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_note_embeddings_note_id ON note_embeddings (note_id);
    `);
    
    client.release();
    console.log('✅ Supabase pgvector initialized');
  } catch (err) {
    console.error('❌ Error initializing Supabase:', err.message);
  }
};

module.exports = {
  pool,
  initDb
};
