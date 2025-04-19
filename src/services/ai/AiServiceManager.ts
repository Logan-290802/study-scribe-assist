
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
    
    // Log to confirm initialization
    console.log("AiServiceManager initialized with Claude service");

    // Check if Claude API key is available
    const claudeApiKey = apiKeys?.claude || import.meta.env.VITE_CLAUDE_API_KEY;
    if (!claudeApiKey) {
      console.warn("No Claude API key found. Using mock responses.");
    }
  }
  
  async processTextWithAi(text: string, action: 'research' | 'critique' | 'expand'): Promise<AiResponse> {
    // Use only Claude for all actions for now
    console.log(`Processing action: ${action} with Claude, text: "${text.substring(0, 30)}..."`);
    
    try {
      const response = await this.claudeService.query(text);
      console.log("Claude response received:", response.content.substring(0, 50) + "...");
      return response;
    } catch (error) {
      console.error("Error in processTextWithAi:", error);
      throw error;
    }
  }
}

// Create a singleton instance for use throughout the app
export const aiServiceManager = new AiServiceManager({
  claude: import.meta.env.VITE_CLAUDE_API_KEY
});
