
import { AiService, AiResponse, AiServiceOptions } from './AiService';
import { toast } from '@/components/ui/use-toast';

export class ClaudeService extends AiService {
  constructor(options?: AiServiceOptions) {
    super(options);
  }
  
  async query(text: string): Promise<AiResponse> {
    try {
      // Always use the apiKey provided in constructor (built-in API key)
      console.log('Querying Claude API with text:', text.substring(0, 50) + '...');
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'anthropic-version': '2023-06-01',
          'x-api-key': this.apiKey || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          messages: [
            {
              role: 'system',
              content: 'You are a creative, thoughtful research assistant who helps writers and students develop their ideas, find relevant information, and improve their academic writing. Your responses should be clear, well-structured, and academically oriented. When appropriate, include relevant citations or references to academic sources.'
            },
            {
              role: 'user',
              content: text
            }
          ],
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Claude API error response:', errorData);
        throw new Error(`Claude API error (${response.status}): ${errorData}`);
      }

      const data = await response.json();
      console.log('Claude API response received:', data);
      
      if (!data.content || !data.content[0] || !data.content[0].text) {
        console.error('Unexpected Claude API response format:', data);
        throw new Error('Unexpected response format from Claude API');
      }

      return {
        content: data.content[0].text,
        source: 'Anthropic Claude'
      };
    } catch (error) {
      console.error('Error in Claude service:', error);
      
      // Use a generic error response without showing the API key configuration message
      return {
        content: `I apologize, but I encountered an error while processing your request. Please try again later.`,
        error: error instanceof Error ? error.message : String(error),
        source: 'Anthropic Claude (Error)'
      };
    }
  }
}
