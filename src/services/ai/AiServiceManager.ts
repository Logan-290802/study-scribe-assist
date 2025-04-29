
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
    if (this.claudeService.apiKey) {
      console.log('Using Claude service for request');
      return this.claudeService.query(text);
    }
    
    // If Claude is not available, try service-specific fallbacks
    switch (action) {
      case 'research':
        if (this.perplexityService.apiKey) {
          return this.perplexityService.query(text);
        }
        break;
      case 'critique':
        if (this.openAiService.apiKey) {
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
    return !!(this.claudeService.apiKey || this.openAiService.apiKey || this.perplexityService.apiKey);
  }
  
  // Specifically check if Claude API is configured
  hasClaudeApiKey(): boolean {
    return !!this.claudeService.apiKey;
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

// Create a singleton instance for use throughout the app
// Load API keys from localStorage initially
const loadApiKeysFromStorage = () => {
  if (typeof window === 'undefined') return {};
  return {
    perplexity: localStorage.getItem('perplexity_api_key') || undefined,
    openai: localStorage.getItem('openai_api_key') || undefined,
    claude: localStorage.getItem('claude_api_key') || undefined
  };
};

export const aiServiceManager = new AiServiceManager(loadApiKeysFromStorage());
