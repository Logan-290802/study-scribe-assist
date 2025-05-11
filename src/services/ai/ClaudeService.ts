import { AiService, AiResponse, AiServiceOptions } from './AiService';
import { toast } from '@/components/ui/use-toast';
import Anthropic from '@anthropic-ai/sdk';
import { fileToBase64, createClaudeFileMessage, isClaudeCompatibleFile } from '@/utils/file-processing';

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
    } else {
      console.warn('No API key provided to ClaudeService');
    }
  }
  
  async query(text: string): Promise<AiResponse> {
    try {
      console.log('Querying Claude API with text:', text.substring(0, 50) + '...');
      
      // Check if we have an initialized client, if not try to initialize it
      if (!this.anthropic) {
        // If no API key is available, return a friendly message
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
          console.log('Anthropic client initialized successfully');
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

  /**
   * Process a file with Claude API and return analysis
   * @param file The file to analyze
   * @param prompt Optional prompt to guide the analysis
   * @returns Promise with Claude's analysis
   */
  async queryWithFile(file: File, prompt?: string): Promise<AiResponse> {
    try {
      console.log(`Processing file with Claude: ${file.name} (${file.type}, ${file.size} bytes)`);
      
      // Check if file is compatible
      if (!isClaudeCompatibleFile(file)) {
        return {
          content: `I'm unable to analyze this file type (${file.type}). I can currently process PDFs and images.`,
          error: "Unsupported file type",
          source: 'Claude Assistant'
        };
      }

      // Check if we have an initialized client, if not try to initialize it
      if (!this.anthropic) {
        // If no API key is available, return a friendly message
        if (!this.apiKey) {
          console.error('No Claude API key available for file analysis');
          return {
            content: "I'm unable to analyze this file as my connection to Claude is not configured properly.",
            source: 'Claude Assistant',
            error: "No API key available"
          };
        }
        
        try {
          this.anthropic = new Anthropic({
            apiKey: this.apiKey,
            dangerouslyAllowBrowser: true
          });
        } catch (initError) {
          console.error('Error initializing Anthropic client for file analysis:', initError);
          return {
            content: "I'm having trouble connecting to my research database to analyze this file.",
            error: initError instanceof Error ? initError.message : String(initError),
            source: 'Claude Assistant'
          };
        }
      }

      // Convert file to base64
      const { base64, mediaType } = await fileToBase64(file);
      console.log('File converted to base64 successfully');

      // Default prompt if none provided
      const defaultPrompt = `Please analyze this ${file.name} and provide a summary of its key contents and insights.`;
      
      // Create message content with the file
      const content = createClaudeFileMessage(base64, mediaType, file.name, prompt || defaultPrompt);

      console.log('Sending file to Claude API for analysis...');
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-latest',
        max_tokens: 1024,
        temperature: 0.7,
        system: 'You are a creative, thoughtful research assistant who helps writers and students analyze documents and images. When analyzing documents, focus on extracting key information, identifying main themes, and providing useful insights.',
        messages: [
          {
            role: 'user',
            content
          }
        ]
      });
      
      console.log('Claude API response received for file analysis');
      
      // Extract the text content from the response
      let extractedContent = '';
      
      // Process each content block
      if (response.content && Array.isArray(response.content)) {
        response.content.forEach(block => {
          // Check if the block is a text block
          if (block.type === 'text') {
            extractedContent += block.text;
          }
        });
      }
      
      return {
        content: extractedContent || `I've analyzed ${file.name} but couldn't generate a summary. Please try again.`,
        source: 'Claude File Analysis'
      };
    } catch (error) {
      console.error('Error in Claude file analysis:', error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error details:', errorMessage);
      
      // Show a toast notification
      toast({
        title: "File Analysis Error",
        description: "There was an issue analyzing your file with Claude.",
        variant: "destructive",
      });
      
      return {
        content: "I encountered a problem analyzing your file. This might be due to file size limits (32MB max) or a temporary issue with the Claude API.",
        error: errorMessage,
        source: 'Claude Assistant'
      };
    }
  }
}
