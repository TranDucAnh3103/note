const GrokProvider = require('../provider/GrokProvider');
const { summarizeTool, formatTool } = require('../tools/noteTools');

class NoteAgent {
  constructor() {
    this.provider = new GrokProvider();
  }

  async summarizeNote(noteId, userId, userAiConfig = null) {
    return await summarizeTool(noteId, userId, this.provider, userAiConfig);
  }

  async formatText(content, userAiConfig = null) {
    return await formatTool(content, this.provider, userAiConfig);
  }

  async chat(userId, query, userAiConfig = null) {
    const embeddingService = require('../../services/embeddingService');
    const noteService = require('../../services/noteService');
    const folderService = require('../../services/folderService');
    
    const systemInstruction = `You are a helpful AI assistant for MemoStack note-taking app. 
You can search notes, create notes, and create folders. 
If the user asks a question, search for relevant notes first before answering.`;

    const tools = [
      {
        type: 'function',
        function: {
          name: 'search_notes',
          description: 'Search the user\'s notes for information using semantic search',
          parameters: {
            type: 'object',
            properties: {
              search_query: { type: 'string', description: 'The semantic query to search for' }
            },
            required: ['search_query']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'create_note',
          description: 'Create a new note for the user',
          parameters: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              content: { type: 'string' },
              tags: { type: 'array', items: { type: 'string' } }
            },
            required: ['title', 'content']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'create_folder',
          description: 'Create a new folder to organize notes',
          parameters: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Name of the folder' },
              color: { type: 'string', description: 'Hex color code for the folder (e.g. #3b82f6)' }
            },
            required: ['name']
          }
        }
      }
    ];

    const messages = [{ role: 'user', content: query }];
    
    // Step 1: Let the model decide whether to call tools
    const response1 = await this.provider.generateText(messages, systemInstruction, userAiConfig, tools);
    
    if (response1.tool_calls) {
      messages.push(response1); // Append the assistant's tool call message
      
      // Step 2: Execute the tools
      for (const toolCall of response1.tool_calls) {
        const fnName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);
        let toolResult = '';
        
        try {
          if (fnName === 'search_notes') {
            const results = await embeddingService.searchSimilarNotes(userId, args.search_query, 3);
            if (results.length > 0) {
              toolResult = results.map(r => `Title: ${r.metadata.title || 'Untitled'}\nContent snippet: ${r.content_chunk}`).join('\n\n');
            } else {
              toolResult = 'No relevant notes found.';
            }
          } else if (fnName === 'create_note') {
            const newNote = await noteService.create({
              userId,
              title: args.title,
              content: args.content,
              tags: args.tags || []
            });
            // Also index the note in background
            embeddingService.processAndStoreNote(newNote).catch(console.error);
            toolResult = `Note created successfully with ID: ${newNote._id}`;
          } else if (fnName === 'create_folder') {
            const newFolder = await folderService.create({
              userId,
              name: args.name,
              color: args.color || '#3b82f6'
            });
            toolResult = `Folder created successfully with ID: ${newFolder._id}`;
          } else {
            toolResult = `Unknown function: ${fnName}`;
          }
        } catch (error) {
          toolResult = `Error executing ${fnName}: ${error.message}`;
        }
        
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          name: fnName,
          content: toolResult
        });
      }
      
      // Step 3: Get the final response from the model
      const finalResponse = await this.provider.generateText(messages, systemInstruction, userAiConfig);
      return typeof finalResponse === 'string' ? finalResponse : finalResponse.content;
    }
    
    return typeof response1 === 'string' ? response1 : response1.content;
  }
}

module.exports = new NoteAgent();
