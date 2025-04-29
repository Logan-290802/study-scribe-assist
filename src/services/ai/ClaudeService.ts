
import { AiService, AiResponse, AiServiceOptions } from './AiService';
import { toast } from '@/components/ui/use-toast';
import Anthropic from '@anthropic-ai/sdk';

export class ClaudeService extends AiService {
  private anthropic: Anthropic | null = null;
  
  constructor(options?: AiServiceOptions) {
    super(options);
    
    // Initialize the Anthropic client if we have an API key
    if (this.apiKey) {
      try {
        this.anthropic = new Anthropic({
          apiKey: this.apiKey,
          // Allow browser usage with proper warning
          dangerouslyAllowBrowser: true
        });
        console.log('Anthropic client initialized successfully');
      } catch (error) {
        console.error('Error initializing Anthropic client:', error);
      }
    }
  }
  
  async query(text: string): Promise<AiResponse> {
    try {
      console.log('Querying Claude API with text:', text.substring(0, 50) + '...');
      
      if (!this.anthropic) {
        if (!this.apiKey) {
          throw new Error('Claude API key is not configured');
        }
        
        console.log('Initializing Anthropic client with API key');
        this.anthropic = new Anthropic({
          apiKey: this.apiKey,
          // Allow browser usage with proper warning
          dangerouslyAllowBrowser: true
        });
      }

      console.log('Sending message to Claude API...');
      const response = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        temperature: 0.7,
        system: 'You are a creative, thoughtful research assistant who helps writers and students develop their ideas, find relevant information, and improve their academic writing. Your responses should be clear, well-structured, and academically oriented. When appropriate, include relevant citations or references to academic sources.',
        messages: [
          {
            role: 'user',
            content: text
          }
        ]
      });
      
      console.log('Claude API response received:', response);
      
      // Extract the text content from the response
      let extractedContent = '';
      
      // Check if response.content exists and is an array
      if (response.content && Array.isArray(response.content)) {
        // Process each content block
        response.content.forEach(block => {
          // Check if the block is a text block
          if (block.type === 'text') {
            extractedContent += block.text;
          }
        });
      }
      
      console.log('Extracted content:', extractedContent);
      
      return {
        content: extractedContent || "Sorry, I couldn't generate a proper response.",
        source: 'Anthropic Claude'
      };
    } catch (error) {
      console.error('Error in Claude service:', error);
      
      // Provide a detailed error message for debugging
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error details:', errorMessage);
      
      // Return a user-friendly error message
      return {
        content: `I apologize, but I encountered an error while processing your request. Please try again later.`,
        error: errorMessage,
        source: 'Anthropic Claude (Error)'
      };
    }
  }
}
