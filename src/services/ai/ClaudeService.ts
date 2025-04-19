
import { AiService, AiResponse, AiServiceOptions } from './AiService';

export class ClaudeService extends AiService {
  constructor(options?: AiServiceOptions) {
    super(options);
  }
  
  async query(text: string): Promise<AiResponse> {
    try {
      // Use either the provided API key or check for environment variable
      const apiKey = this.apiKey || import.meta.env.VITE_CLAUDE_API_KEY || "";
      
      if (!apiKey) {
        console.error("No Claude API key available");
        return this.mockResponse(text);
      }
      
      console.log("Making request to Claude API with text:", text.substring(0, 50) + "...");
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'anthropic-version': '2023-06-01',
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          messages: [
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
        console.error(`Claude API error (${response.status}):`, errorData);
        throw new Error(`Claude API error (${response.status}): ${errorData}`);
      }

      const data = await response.json();
      console.log("Claude API response received successfully");
      
      // Proper parsing of Claude's response format
      if (!data.content || data.content.length === 0) {
        throw new Error('Unexpected response format from Claude API');
      }

      return {
        content: data.content[0].text,
        source: 'Anthropic Claude'
      };
    } catch (error) {
      console.error('Error in Claude service:', error);
      throw error; // Re-throw to allow proper error handling upstream
    }
  }
  
  // For development or when API key is not available
  private mockResponse(text: string): AiResponse {
    console.log("Using mock response for Claude");
    return {
      content: `This is a mock response to: "${text.substring(0, 30)}..."

I'm currently in mock mode because no API key was provided. Please set up a valid Claude API key to get real responses.`,
      source: 'Anthropic Claude (Mock)'
    };
  }
}
