
import { AiService, AiResponse, AiServiceOptions } from './AiService';

export class ClaudeService extends AiService {
  constructor(options?: AiServiceOptions) {
    super(options);
  }
  
  async query(text: string): Promise<AiResponse> {
    try {
      // Use either the provided API key or check for environment variable or localStorage
      const apiKey = this.apiKey || localStorage.getItem('CLAUDE_API_KEY') || "";
      
      if (!apiKey) {
        console.error("No Claude API key available");
        return {
          content: "I couldn't process your request because no Claude API key is configured. Please go to Tools > AI Configuration to add your API key.",
          source: 'Claude (No API Key)'
        };
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
        return {
          content: `I encountered an API error (${response.status}) when trying to process your request. Please check your API key in Tools > AI Configuration.`,
          source: 'Claude Error'
        };
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
      return {
        content: "I encountered an error processing your request. Please try again or check your API key in Tools > AI Configuration.",
        source: 'Claude Error'
      };
    }
  }
}
