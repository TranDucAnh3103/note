import api from "./client";

export const aiApi = {
  formatText: (content: string) => 
    api.post("/ai/format", { content }),
  
  summarizeNote: (noteId: string) => 
    api.post("/ai/summarize", { noteId }),
    
  chat: (query: string) => 
    api.post("/ai/chat", { query }),
};
