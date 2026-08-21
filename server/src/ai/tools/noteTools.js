const noteService = require('../../services/noteService');
const Note = require('../../models/Note');

const summarizeTool = async (noteId, userId, aiProvider, userAiConfig = null) => {
  const note = await Note.findOne({ _id: noteId, userId });
  
  if (!note) {
    throw new Error('Note not found or unauthorized');
  }

  const prompt = `Please summarize the following note content and suggest up to 5 relevant tags (comma separated). 
  Respond strictly in this JSON format without markdown wrapping:
  {
    "summary": "your summary here",
    "tags": ["tag1", "tag2"]
  }

  Note Content:
  ${note.content}
  `;

  const systemInstruction = 'You are a helpful AI assistant that summarizes notes and extracts tags.';
  
  const aiResponse = await aiProvider.generateText(prompt, systemInstruction, userAiConfig);
  
  let result;
  try {
    // Sometimes AI returns markdown code block
    const cleanedJson = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    result = JSON.parse(cleanedJson);
  } catch (error) {
    console.error('AI returned invalid JSON:', aiResponse);
    throw new Error('AI failed to generate a valid summary');
  }

  // Save back to note
  const updatedNote = await noteService.update(noteId, {
    summary: result.summary,
    tags: [...new Set([...note.tags, ...result.tags])].slice(0, 10),
    isAiProcessed: true
  });

  return updatedNote;
};

const formatTool = async (content, aiProvider, userAiConfig = null) => {
  const prompt = `Please format and clean up the following raw text into a well-structured markdown document. 
  Add headings and bullet points where appropriate, but do not change the core meaning or information.
  
  Raw Text:
  ${content}
  `;

  const systemInstruction = 'You are an expert technical writer and document formatter.';
  
  const formattedContent = await aiProvider.generateText(prompt, systemInstruction, userAiConfig);
  return formattedContent;
};

module.exports = {
  summarizeTool,
  formatTool
};
