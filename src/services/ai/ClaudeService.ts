
import { AiService, AiResponse, AiServiceOptions } from './AiService';
import { toast } from '@/components/ui/use-toast';
import Anthropic from '@anthropic-ai/sdk';
import { fileToBase64, createClaudeFileMessage, isClaudeCompatibleFile } from '@/utils/file-processing';
import { initializeClaudeClient, extractClaudeContent, createClaudeMessage } from './helpers/claude-helpers';
import { DEFAULT_CLAUDE_OPTIONS, FILE_ANALYSIS_SYSTEM_PROMPT, ClaudeFileAnalysisOptions, ContentBlockParam, ChatHistoryMessage } from './types/claude-types';

export class ClaudeService extends AiService {
  private anthropic: Anthropic | null = null;
  
  constructor(options?: AiServiceOptions) {
    super(options);
    this.anthropic = initializeClaudeClient(this.apiKey);
  }
  
  async query(text: string, chatHistory?: ChatHistoryMessage[]): Promise<AiResponse> {
    try {
      console.log('Querying Claude API with text:', text.substring(0, 50) + '...');
      if (chatHistory && chatHistory.length > 0) {
        console.log(`Including ${chatHistory.length} previous messages in conversation history`);
      }
      
      // Initialize client if not already done
      if (!this.anthropic) {
        if (!this.apiKey) {
          console.error('No Claude API key available');
          return {
            content: "I'm ready to help with your research! What would you like to know?",
            source: 'Claude Assistant'
          };
        }
        
        this.anthropic = initializeClaudeClient(this.apiKey);
        if (!this.anthropic) {
          return {
            content: "I'm having trouble connecting to my research database. Let me try again in a moment.",
            error: "Failed to initialize Claude client",
            source: 'Claude Assistant'
          };
        }
      }

      console.log('Sending message to Claude API...');
      const messageConfig = createClaudeMessage(text, { chatHistory });
      const response = await this.anthropic.messages.create(messageConfig);
      
      console.log('Claude API response received:', response);
      const extractedContent = extractClaudeContent(response);
      
      return {
        content: extractedContent,
        source: 'Anthropic Claude'
      };
    } catch (error) {
      console.error('Error in Claude service:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error details:', errorMessage);
      
      toast({
        title: "Claude API Error",
        description: "There was an issue connecting to Claude. Please try again later.",
        variant: "destructive",
      });
      
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
      
      if (!isClaudeCompatibleFile(file)) {
        console.warn(`User attempted to upload incompatible file type: ${file.type}`);
        return {
          content: `I'm unable to analyze this file type (${file.type}). I can currently process PDFs and images.`,
          error: "Unsupported file type",
          source: 'Claude Assistant'
        };
      }

      // Initialize client if needed
      if (!this.anthropic) {
        if (!this.apiKey) {
          console.error('No Claude API key available for file analysis');
          return {
            content: "I'm unable to analyze this file as my connection to Claude is not configured properly.",
            source: 'Claude Assistant',
            error: "No API key available"
          };
        }
        
        this.anthropic = initializeClaudeClient(this.apiKey);
        if (!this.anthropic) {
          return {
            content: "I'm having trouble connecting to my research database to analyze this file.",
            error: "Failed to initialize Claude client",
            source: 'Claude Assistant'
          };
        }
      }

      // Convert file to base64
      console.log('Starting file conversion to base64...');
      const { base64, mediaType } = await fileToBase64(file);
      console.log('File converted to base64 successfully, length:', base64.length);

      // Validate that we actually have file content
      if (!base64 || base64.length < 100) {
        console.error('File conversion to base64 produced suspiciously small output:', base64.length);
        throw new Error('File conversion failed or produced invalid output');
      }

      // Default prompt if none provided
      const defaultPrompt = `Please analyze this ${file.name} and provide a summary of its key contents and insights.`;
      const userPrompt = prompt || defaultPrompt;
      
      // Create properly typed content blocks for Claude API
      const contentBlocks = createClaudeFileMessage(base64, mediaType, file.name, userPrompt);
      
      console.log('Sending file to Claude API for analysis...', {
        fileSize: file.size,
        base64Length: base64.length,
        mediaType: mediaType,
        modelUsed: DEFAULT_CLAUDE_OPTIONS.model || 'claude-3-5-sonnet-latest'
      });
      
      const response = await this.anthropic.messages.create({
        model: DEFAULT_CLAUDE_OPTIONS.model || 'claude-3-5-sonnet-latest',
        max_tokens: DEFAULT_CLAUDE_OPTIONS.maxTokens || 1024,
        temperature: DEFAULT_CLAUDE_OPTIONS.temperature || 0.7,
        system: FILE_ANALYSIS_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user' as const,
            content: contentBlocks as any
          }
        ]
      });
      
      console.log('Claude API response received for file analysis');
      const extractedContent = extractClaudeContent(response);
      
      // Check if the response suggests Claude couldn't see the file
      if (extractedContent.includes("cannot see") || 
          extractedContent.includes("cannot access") || 
          extractedContent.includes("not able to view") ||
          extractedContent.includes("wasn't able to view")) {
        console.error('Claude response indicates it could not access the file content');
        throw new Error('Claude could not access the file content');
      }
      
      return {
        content: extractedContent || `I've analyzed ${file.name} but couldn't generate a summary. Please try again.`,
        source: 'Claude File Analysis'
      };
    } catch (error) {
      console.error('Error in Claude file analysis:', error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error details:', errorMessage);
      
      let userFriendlyMessage = "I encountered a problem analyzing your file.";
      
      // Provide more specific error messages
      if (errorMessage.includes('Claude could not access the file')) {
        userFriendlyMessage = "I couldn't access the contents of your file. This could be due to a file format issue or corruption. Please try uploading the file again or try a different file format.";
      } else if (errorMessage.includes('token limit')) {
        userFriendlyMessage = "Your file is too large for me to process. Please try a smaller file (under 32MB) or a file with fewer pages.";
      } else if (errorMessage.includes('conversion failed')) {
        userFriendlyMessage = "There was a problem converting your file for analysis. Please try a different file format or ensure the file isn't corrupted.";
      }
      
      toast({
        title: "File Analysis Error",
        description: "There was an issue analyzing your file with Claude.",
        variant: "destructive",
      });
      
      return {
        content: userFriendlyMessage,
        error: errorMessage,
        source: 'Claude Assistant'
      };
    }
  }
}
