
import { AiResponse } from '../AiService';
import { CriticalSuggestion } from '../CriticalThinkingService';

export interface ApiKeys {
  perplexity?: string;
  openai?: string; 
  claude?: string;
}

export interface FileAnalysisOptions {
  prompt?: string;
}

export interface ProcessTextOptions {
  action: 'research' | 'critique' | 'expand';
  chatHistory?: ChatHistoryMessage[];
}

export interface ChatHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}
