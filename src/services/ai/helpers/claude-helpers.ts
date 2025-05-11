
import Anthropic from '@anthropic-ai/sdk';
import { toast } from '@/components/ui/use-toast';
import { DEFAULT_CLAUDE_OPTIONS, ClaudeMessageOptions, ChatHistoryMessage } from '../types/claude-types';

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
 * Create Claude message with options and chat history
 * @param text The new message text
 * @param options Message options including chat history
 * @returns Message configuration object
 */
export const createClaudeMessage = (text: string, options: ClaudeMessageOptions = DEFAULT_CLAUDE_OPTIONS) => {
  const { model, maxTokens, temperature, systemPrompt, chatHistory } = {
    ...DEFAULT_CLAUDE_OPTIONS,
    ...options
  };

  // Create the base messages array with the new user message
  let messages = [
    { role: 'user' as const, content: text }
  ];

  // If chat history exists, insert it at the beginning of the messages array
  if (chatHistory && chatHistory.length > 0) {
    // Convert chat history to Anthropic's expected format
    const historyMessages = chatHistory.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    }));
    
    // Insert history messages before the current message
    messages = [...historyMessages, ...messages];
    
    console.log('Including chat history in Claude request:', historyMessages.length, 'messages');
  }

  return {
    model,
    max_tokens: maxTokens,
    temperature,
    system: systemPrompt,
    messages
  };
};
