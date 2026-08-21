const AIProviderInterface = require('./AIProviderInterface');
const config = require('../../config');

class GrokProvider extends AIProviderInterface {
  constructor() {
    super();
    this.apiKey = config.ai.grokApiKey;
    this.baseUrl = config.ai.grokBaseUrl;
    
    if (!this.apiKey) {
      console.warn('⚠️ GROK_API_KEY is not set in environment variables');
    }
  }

  async generateText(prompt, systemInstruction = '', userAiConfig = null, tools = null) {
    const apiKey = (userAiConfig && userAiConfig.apiKey) || this.apiKey;
    const model = (userAiConfig && userAiConfig.model) || 'minimax/minimax-m2.7';
    let baseUrl = this.baseUrl;
    
    // Override baseUrl based on provider if not default
    if (userAiConfig && userAiConfig.provider && userAiConfig.provider !== 'default') {
      if (userAiConfig.provider === 'xkiro') baseUrl = 'https://api.xkiro.com/v1';
      else if (userAiConfig.provider === '9router') baseUrl = 'https://api.9router.com/v1';
      else if (userAiConfig.provider === 'openrouter') baseUrl = 'https://openrouter.ai/api/v1';
    }

    if (!apiKey) throw new Error('AI API Key is missing');

    const messages = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    
    if (Array.isArray(prompt)) {
      messages.push(...prompt);
    } else {
      messages.push({ role: 'user', content: prompt });
    }

    const payload = {
      model: model,
      messages: messages,
      temperature: 0.3,
    };
    
    if (tools) {
      payload.tools = tools;
      payload.tool_choice = 'auto';
    }

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Grok API Error:', errorData);
        throw new Error(`Grok API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const message = data.choices[0].message;
      
      if (message.tool_calls) {
        return message; // Return full message for tool calling
      }
      
      return message.content?.trim() || '';
    } catch (error) {
      console.error('AI Provider Error:', error);
      throw error;
    }
  }
}

module.exports = GrokProvider;
