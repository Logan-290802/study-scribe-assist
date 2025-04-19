
import { AiService, AiResponse } from './AiService';
import { PerplexityService } from './PerplexityService';
import { OpenAiService } from './OpenAiService';
import { ClaudeService } from './ClaudeService';

export class AiServiceManager {
  private perplexityService: PerplexityService;
  private openAiService: OpenAiService;
  private claudeService: ClaudeService;
  
  constructor(apiKeys?: { perplexity?: string; openai?: string; claude?: string }) {
    this.perplexityService = new PerplexityService({ apiKey: apiKeys?.perplexity });
    this.openAiService = new OpenAiService({ apiKey: apiKeys?.openai });
    this.claudeService = new ClaudeService({ apiKey: apiKeys?.claude });
  }
  
  async processTextWithAi(text: string, action: 'research' | 'critique' | 'expand'): Promise<AiResponse> {
    // For now, use Claude for all actions
    console.log(`Processing action: ${action} with Claude`);
    return this.claudeService.query(text);
    
    // The following code will be re-enabled later when we want to use different services
    /*
    switch (action) {
      case 'research':
        return this.perplexityService.query(text);
      case 'critique':
        return this.openAiService.query(text);
      case 'expand':
        return this.claudeService.query(text);
      default:
        return { 
          content: 'Unknown action requested',
          error: 'Invalid action type'
        };
    }
    */
  }
}

// Create a singleton instance for use throughout the app
export const aiServiceManager = new AiServiceManager();
