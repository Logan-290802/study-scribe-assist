
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
    this.perplexityService = new PerplexityService({ apiKey: apiKeys?.perplexity });
    this.openAiService = new OpenAiService({ apiKey: apiKeys?.openai });
    this.claudeService = new ClaudeService({ apiKey: apiKeys?.claude });
    this.criticalThinkingService = new CriticalThinkingService({ apiKey: apiKeys?.claude || apiKeys?.openai });
    
    // Log which services are available based on API keys
    console.log('AI Services initialized:', {
      claudeAvailable: !!apiKeys?.claude,
      openAiAvailable: !!apiKeys?.openai,
      perplexityAvailable: !!apiKeys?.perplexity
    });
  }
  
  async processTextWithAi(text: string, action: 'research' | 'critique' | 'expand'): Promise<AiResponse> {
    // Main processing logic based on action
    console.log(`Processing AI action: ${action} with text: ${text.substring(0, 50)}...`);
    
    // For MVP, prioritize Claude for all actions if the API key is available
    if (this.claudeService.hasApiKey) {
      console.log('Using Claude service for request');
      return this.claudeService.query(text);
    }
    
    // If Claude is not available, try service-specific fallbacks
    switch (action) {
      case 'research':
        if (this.perplexityService.hasApiKey) {
          return this.perplexityService.query(text);
        }
        break;
      case 'critique':
        if (this.openAiService.hasApiKey) {
          return this.openAiService.query(text);
        }
        break;
      case 'expand':
        // Already tried Claude above, no fallback
        break;
    }
    
    // If we reach here, use Claude with mock response as final fallback
    console.log('No suitable API key found, using Claude with mock response');
    return this.claudeService.query(text);
  }
  
  async analyzeCriticalThinking(text: string): Promise<CriticalSuggestion[]> {
    return this.criticalThinkingService.analyzeText(text);
  }
  
  // Check if any API keys are configured
  hasAnyApiKey(): boolean {
    return !!(this.claudeService.hasApiKey || this.openAiService.hasApiKey || this.perplexityService.hasApiKey);
  }
  
  // Specifically check if Claude API is configured
  hasClaudeApiKey(): boolean {
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
