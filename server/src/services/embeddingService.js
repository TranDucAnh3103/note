const axios = require('axios');
const { pool } = require('../config/supabase');
const config = require('../config');

// Get embeddings using OpenRouter
const generateEmbedding = async (text) => {
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/embeddings',
      {
        model: config.openrouter.embedModel,
        input: text,
      },
      {
        headers: {
          'Authorization': `Bearer ${config.openrouter.embedKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5173', // Your site URL
          'X-Title': 'MemoStack', // Your site name
        },
      }
    );

    // Ensure we have data
    if (response.data && response.data.data && response.data.data.length > 0) {
      return response.data.data[0].embedding;
    }
    
    throw new Error('No embedding returned from OpenRouter');
  } catch (error) {
    console.error('Error generating embedding:', error.response?.data || error.message);
    throw new Error('Failed to generate embedding');
  }
};

// Chunk text into smaller pieces
const chunkText = (text, maxLength = 1000) => {
  if (!text) return [];
  const chunks = [];
  let currentChunk = '';
  
  // Split by paragraphs first
  const paragraphs = text.split(/\n\s*\n/);
  
  for (const p of paragraphs) {
    if (currentChunk.length + p.length > maxLength && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = '';
    }
    currentChunk += p + '\n\n';
  }
  
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
};

// Save chunks and embeddings to pgvector
const processAndStoreNote = async (note) => {
  if (!note || !note.content) return;
  
  const client = await pool.connect();
  try {
    // Delete existing embeddings for this note
    await client.query('DELETE FROM note_embeddings WHERE note_id = $1', [note._id.toString()]);
    
    const chunks = chunkText(note.content);
    
    for (const chunk of chunks) {
      if (chunk.length < 10) continue; // Skip very small chunks
      
      const embedding = await generateEmbedding(chunk);
      
      // Store in pgvector
      await client.query(
        `INSERT INTO note_embeddings (note_id, user_id, content_chunk, embedding, metadata)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          note._id.toString(),
          note.userId.toString(),
          chunk,
          `[${embedding.join(',')}]`,
          JSON.stringify({ title: note.title, tags: note.tags || [] })
        ]
      );
    }
    
  } catch (error) {
    console.error('Error storing note embedding:', error);
  } finally {
    client.release();
  }
};

// Search similar notes
const searchSimilarNotes = async (userId, query, limit = 5) => {
  const client = await pool.connect();
  try {
    const queryEmbedding = await generateEmbedding(query);
    
    // Cosine similarity search using pgvector
    const result = await client.query(
      `SELECT 
        note_id, 
        content_chunk, 
        metadata,
        1 - (embedding <=> $1) AS similarity 
       FROM note_embeddings 
       WHERE user_id = $2
       ORDER BY embedding <=> $1
       LIMIT $3`,
      [`[${queryEmbedding.join(',')}]`, userId.toString(), limit]
    );
    
    return result.rows;
  } catch (error) {
    console.error('Error searching similar notes:', error);
    return [];
  } finally {
    client.release();
  }
};

// Delete note embeddings
const deleteNoteEmbeddings = async (noteId) => {
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM note_embeddings WHERE note_id = $1', [noteId.toString()]);
  } catch (error) {
    console.error('Error deleting note embeddings:', error);
  } finally {
    client.release();
  }
};

module.exports = {
  processAndStoreNote,
  searchSimilarNotes,
  deleteNoteEmbeddings,
  generateEmbedding
};
