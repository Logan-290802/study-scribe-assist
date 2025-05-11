
import Anthropic from '@anthropic-ai/sdk';
import { toast } from '@/components/ui/use-toast';
import { ContentBlockParam } from '@anthropic-ai/sdk';
import { DEFAULT_CLAUDE_OPTIONS, ClaudeMessageOptions } from '../types/claude-types';

/**
 * Initialize the Anthropic client with an API key
 * @param apiKey The API key for Claude
 * @returns An initialized Anthropic client or null
 */
export const initializeClaudeClient = (apiKey?: string): Anthropic | null => {
  if (!apiKey) {
    console.warn('No API key provided to Claude service');
    return null;
  }
  
  try {
    const client = new Anthropic({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });
    console.log('Anthropic client initialized successfully');
    return client;
  } catch (error) {
    console.error('Error initializing Anthropic client:', error);
    toast({
      title: "Claude Service Error",
      description: "Failed to initialize Claude service.",
      variant: "destructive",
    });
    return null;
  }
};

/**
 * Extract text content from Claude API response
 * @param response The response from Claude API
 * @returns Extracted text content
 */
export const extractClaudeContent = (response: any): string => {
  let extractedContent = '';
  
  // Check if response.content exists and is an array
  if (response.content && Array.isArray(response.content)) {
    // Process each content block
    response.content.forEach((block: any) => {
      // Check if the block is a text block
      if (block.type === 'text') {
        extractedContent += block.text;
      }
    });
  }
  
  return extractedContent || "I'm ready to help with your research! What would you like to know?";
};

/**
 * Create Claude message with options
 * @param text The message text
 * @param options Message options
 * @returns Message configuration object
 */
export const createClaudeMessage = (text: string, options: ClaudeMessageOptions = DEFAULT_CLAUDE_OPTIONS) => {
  const { model, maxTokens, temperature, systemPrompt } = {
    ...DEFAULT_CLAUDE_OPTIONS,
    ...options
  };

  return {
    model,
    max_tokens: maxTokens,
    temperature,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: text
      }
    ]
  };
};
