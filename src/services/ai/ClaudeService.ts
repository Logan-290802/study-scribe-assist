
import { AiService, AiResponse, AiServiceOptions } from './AiService';
import { toast } from '@/components/ui/use-toast';

export class ClaudeService extends AiService {
  constructor(options?: AiServiceOptions) {
    super(options);
  }
  
  async query(text: string): Promise<AiResponse> {
    try {
      if (!this.apiKey) {
        toast({
          title: "Claude API Key Missing",
          description: "Please add your Claude API key in the settings to use this feature.",
          variant: "destructive"
        });
        return this.mockResponse(text);
      }
      
      console.log('Querying Claude API with text:', text.substring(0, 50) + '...');
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'anthropic-version': '2023-06-01',
          'x-api-key': this.apiKey,
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
      console.log('Claude API response received', data);
      
      if (!data.content || !data.content[0] || !data.content[0].text) {
        throw new Error('Unexpected response format from Claude API');
      }

      return {
        content: data.content[0].text,
        source: 'Anthropic Claude'
      };
    } catch (error) {
      console.error('Error in Claude service:', error);
      toast({
        title: "Claude API Error",
        description: error.message || "An error occurred while communicating with Claude",
        variant: "destructive"
      });
      
      return {
        content: `I apologize, but I encountered an error while processing your request. ${error.message}`,
        error: error.message,
        source: 'Anthropic Claude (Error)'
      };
    }
  }
  
  // For development or when API key is not available
  private mockResponse(text: string): AiResponse {
    return {
      content: `# AI Response Simulation (Claude API Key Required)

I'm the Claude AI assistant, but I need a valid API key to provide real responses. This is a simulated response to your query: "${text.substring(0, 50)}..."

To enable full functionality:
1. Get a Claude API key from https://console.anthropic.com/settings/keys
2. Add it in the AI API Keys settings

Once configured, I can help with research, writing assistance, and idea development using genuine Claude AI responses.`,
      source: 'Anthropic Claude (Mock)'
    };
  }
}
