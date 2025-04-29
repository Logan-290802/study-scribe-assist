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
  
  // Updated with your newly generated Claude API key
  private builtInClaudeKey: string = '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';
  
  constructor(apiKeys?: { perplexity?: string; openai?: string; claude?: string }) {
    console.log('Initializing AI Services');
    
    // Use built-in Claude key if no Claude key is provided
    const claudeKey = apiKeys?.claude || this.builtInClaudeKey;
    console.log('Using Claude key:', claudeKey ? 'Key available' : 'No key available');
    
    this.perplexityService = new PerplexityService({ apiKey: apiKeys?.perplexity });
    this.openAiService = new OpenAiService({ apiKey: apiKeys?.openai });
    this.claudeService = new ClaudeService({ apiKey: claudeKey });
    
    // Use Claude key first, fall back to OpenAI if Claude isn't available
    this.criticalThinkingService = new CriticalThinkingService({ 
      apiKey: claudeKey || apiKeys?.openai 
    });
  }
  
  async processTextWithAi(text: string, action: 'research' | 'critique' | 'expand'): Promise<AiResponse> {
    // Main processing logic based on action
    console.log(`Processing AI action: ${action} with text: ${text.substring(0, 50)}...`);
    
    // Always use Claude first with built-in key
    try {
      console.log('Using Claude service for request');
      return await this.claudeService.query(text);
    } catch (error) {
      console.error('Error using Claude service:', error);
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
  
  async analyzeCriticalThinking(text: string): Promise<CriticalSuggestion[]> {
    return this.criticalThinkingService.analyzeText(text);
  }
  
  // Check if any API keys are configured
  get hasAnyApiKey(): boolean {
    return true;  // Always return true since we have a built-in Claude key
  }
  
  // Specifically check if Claude API is configured
  get hasClaudeApiKey(): boolean {
    return true;  // Always return true since we have a built-in Claude key
  }
  
  // Update API keys
  updateApiKeys(apiKeys: { perplexity?: string; openai?: string; claude?: string }): void {
    if (apiKeys.perplexity) this.perplexityService = new PerplexityService({ apiKey: apiKeys.perplexity });
    if (apiKeys.openai) this.openAiService = new OpenAiService({ apiKey: apiKeys.openai });
    
    // Use user-provided Claude key if available, otherwise keep using the built-in key
    const claudeKey = apiKeys.claude || this.builtInClaudeKey;
    this.claudeService = new ClaudeService({ apiKey: claudeKey });
    
    // Critical thinking service can use either Claude or OpenAI
    this.criticalThinkingService = new CriticalThinkingService({ 
      apiKey: claudeKey || apiKeys.openai 
    });
    
    console.log('AI Service API keys updated');
  }
}

// Create a singleton instance with a built-in Claude API key
export const aiServiceManager = new AiServiceManager();
