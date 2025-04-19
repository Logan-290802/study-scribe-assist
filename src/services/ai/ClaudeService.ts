
import { AiService, AiResponse, AiServiceOptions } from './AiService';

export class ClaudeService extends AiService {
  constructor(options?: AiServiceOptions) {
    super(options);
  }
  
  async query(text: string): Promise<AiResponse> {
    try {
      const apiKey = localStorage.getItem('CLAUDE_API_KEY');
      
      if (!apiKey) {
        return {
          content: "Please add your Claude API key in Tools > AI Configuration to use the chat assistant.",
          source: 'Claude (No API Key)'
        };
      }
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'anthropic-version': '2023-06-01',
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          messages: [{ role: 'user', content: text }],
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        content: data.content[0].text,
        source: 'Claude'
      };
    } catch (error) {
      console.error('Error in Claude service:', error);
      return {
        content: "I encountered an error processing your request. Please try again.",
        source: 'Claude Error'
      };
    }
  }
}
