import { AiService, AiResponse } from './AiService';
import { PerplexityService } from './PerplexityService';
import { OpenAiService } from './OpenAiService';
import { ClaudeService } from './ClaudeService';
import { CriticalThinkingService, CriticalSuggestion } from './CriticalThinkingService';
import { toast } from '@/components/ui/use-toast';

export class AiServiceManager {
  private perplexityService: PerplexityService;
  private openAiService: OpenAiService;
  private claudeService: ClaudeService;
  private criticalThinkingService: CriticalThinkingService;
  
  constructor(apiKeys?: { perplexity?: string; openai?: string; claude?: string }) {
    console.log('Initializing AI Services with keys:', {
      claudeAvailable: !!apiKeys?.claude,
      openAiAvailable: !!apiKeys?.openai,
      perplexityAvailable: !!apiKeys?.perplexity
    });
    
    this.perplexityService = new PerplexityService({ apiKey: apiKeys?.perplexity });
    this.openAiService = new OpenAiService({ apiKey: apiKeys?.openai });
    this.claudeService = new ClaudeService({ apiKey: apiKeys?.claude });
    this.criticalThinkingService = new CriticalThinkingService({ apiKey: apiKeys?.claude || apiKeys?.openai });
  }
  
  async processTextWithAi(text: string, action: 'research' | 'critique' | 'expand'): Promise<AiResponse> {
    // Main processing logic based on action
    console.log(`Processing AI action: ${action} with text: ${text.substring(0, 50)}...`);
    
    // For MVP, prioritize Claude for all actions if the API key is available
    if (this.claudeService.hasApiKey) {
      console.log('Using Claude service for request');
      try {
        return await this.claudeService.query(text);
      } catch (error) {
        console.error('Error using Claude service:', error);
        // If there's an error but we have a key, show a toast but don't fall back
        toast({
          title: "Claude API Error",
          description: "There was an issue connecting to Claude. Please try again later.",
          variant: "destructive",
        });
        
        // Return a user-friendly error
        return {
          content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
          error: error instanceof Error ? error.message : "Unknown error",
          source: "Claude (Error)"
        };
      }
    }
    
    // If Claude is not available or failed, try service-specific fallbacks
    switch (action) {
      case 'research':
        if (this.perplexityService.hasApiKey) {
          try {
            return await this.perplexityService.query(text);
          } catch (error) {
            console.error('Error using Perplexity service:', error);
          }
        }
        break;
      case 'critique':
        if (this.openAiService.hasApiKey) {
          try {
            return await this.openAiService.query(text);
          } catch (error) {
            console.error('Error using OpenAI service:', error);
          }
        }
        break;
      case 'expand':
        // Already tried Claude above, no specific fallback
        break;
    }
    
    // If all else fails, return a friendly message encouraging API key setup
    console.log('No AI service available or all services failed');
    return {
      content: "I'm ready to help with your research and writing! If you'd like more advanced assistance, you can add your own AI API keys in the Tools section.",
      source: "AI Service Manager"
    };
  }
  
  async analyzeCriticalThinking(text: string): Promise<CriticalSuggestion[]> {
    return this.criticalThinkingService.analyzeText(text);
  }
  
  // Check if any API keys are configured
  get hasAnyApiKey(): boolean {
    return !!(this.claudeService.hasApiKey || this.openAiService.hasApiKey || this.perplexityService.hasApiKey);
  }
  
  // Specifically check if Claude API is configured
  get hasClaudeApiKey(): boolean {
    return this.claudeService.hasApiKey;
  }
  
  // Update API keys
  updateApiKeys(apiKeys: { perplexity?: string; openai?: string; claude?: string }): void {
    if (apiKeys.perplexity) this.perplexityService = new PerplexityService({ apiKey: apiKeys.perplexity });
    if (apiKeys.openai) this.openAiService = new OpenAiService({ apiKey: apiKeys.openai });
    if (apiKeys.claude) this.claudeService = new ClaudeService({ apiKey: apiKeys.claude });
    
    // Critical thinking service can use either Claude or OpenAI
    this.criticalThinkingService = new CriticalThinkingService({ 
      apiKey: apiKeys.claude || apiKeys.openai 
    });
    
    console.log('AI Service API keys updated');
  }
}

// Create a singleton instance with a built-in Claude API key
export const aiServiceManager = new AiServiceManager({
  claude: 'sk-ant-api03-UgS13vQiXAfLMJ2VxMOQsjtPYuacGU3wlO7yeQrnNJdvUy9sLKrSrO6HAh2zyzgT94Cu8zdB2ZU33E6j7hWNRA-OLC3YQAA',
});
