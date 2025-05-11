
export interface ClaudeFileAnalysisOptions {
  file: File;
  prompt?: string;
}

export interface ClaudeServiceOptions {
  apiKey?: string;
}

export interface ClaudeMessageOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export const DEFAULT_CLAUDE_OPTIONS: ClaudeMessageOptions = {
  model: 'claude-3-5-sonnet-latest',
  maxTokens: 1024,
  temperature: 0.7,
  systemPrompt: 'You are a creative, thoughtful research assistant who helps writers and students develop their ideas, find relevant information, and improve their academic writing. Your responses should be clear, well-structured, and academically oriented. When appropriate, include relevant citations or references to academic sources.'
};

export const FILE_ANALYSIS_SYSTEM_PROMPT = 'You are a creative, thoughtful research assistant who helps writers and students analyze documents and images. When analyzing documents, focus on extracting key information, identifying main themes, and providing useful insights.';

// Define ContentBlockParam types to match Anthropic's expected structure
export type ContentBlockType = 'text' | 'image' | 'document';

export interface TextBlockParam {
  type: 'text';
  text: string;
}

export interface DocumentBlockParam {
  type: 'document';
  source: {
    type: 'base64';
    media_type: string;
    data: string;
  };
}

export type ContentBlockParam = TextBlockParam | DocumentBlockParam;
