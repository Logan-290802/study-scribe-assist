
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
          dangerouslyAllowBrowser: true
        });
        console.log('Anthropic client initialized successfully');
      } catch (error) {
        console.error('Error initializing Anthropic client:', error);
        toast({
          title: "Claude Service Error",
          description: "Failed to initialize Claude service.",
          variant: "destructive",
        });
      }
    }
  }
  
  async query(text: string): Promise<AiResponse> {
    try {
      console.log('Querying Claude API with text:', text.substring(0, 50) + '...');
      
      if (!this.anthropic) {
        if (!this.apiKey) {
          console.error('No Claude API key available');
          return {
            content: "I'm ready to help with your research! What would you like to know?",
            source: 'Claude Assistant'
          };
        }
        
        console.log('Initializing Anthropic client with API key');
        try {
          this.anthropic = new Anthropic({
            apiKey: this.apiKey,
            dangerouslyAllowBrowser: true
          });
        } catch (initError) {
          console.error('Error initializing Anthropic client:', initError);
          return {
            content: "I'm having trouble connecting to my research database. Let me try again in a moment.",
            error: initError instanceof Error ? initError.message : String(initError),
            source: 'Claude Assistant'
          };
        }
      }

      console.log('Sending message to Claude API...');
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-latest',
        max_tokens: 1024,
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
        content: extractedContent || "I'm ready to help with your research! What would you like to know?",
        source: 'Anthropic Claude'
      };
    } catch (error) {
      console.error('Error in Claude service:', error);
      
      // Provide a detailed error message for debugging
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error details:', errorMessage);
      
      // Show a toast notification for user feedback
      toast({
        title: "Claude API Error",
        description: "There was an issue connecting to Claude. Please try again later.",
        variant: "destructive",
      });
      
      // Return a user-friendly error message
      return {
        content: "I'm having trouble accessing my knowledge database right now. Please try again in a moment.",
        error: errorMessage,
        source: 'Claude Assistant'
      };
    }
  }
}
