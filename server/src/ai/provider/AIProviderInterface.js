class AIProviderInterface {
  /**
   * Sinh ra text từ prompt
   * @param {string} prompt 
   * @param {string} systemInstruction 
   * @returns {Promise<string>}
   */
  async generateText(prompt, systemInstruction = '') {
    throw new Error('Method "generateText()" must be implemented.');
  }
}

module.exports = AIProviderInterface;
