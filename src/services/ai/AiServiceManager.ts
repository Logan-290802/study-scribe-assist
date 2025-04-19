
import { AiService, AiResponse } from './AiService';
import { PerplexityService } from './PerplexityService';
import { OpenAiService } from './OpenAiService';
import { ClaudeService } from './ClaudeService';
import { supabase } from '@/lib/supabase';

export class AiServiceManager {
  private perplexityService: PerplexityService;
  private openAiService: OpenAiService;
  private claudeService: ClaudeService;
  
  constructor(apiKeys?: { perplexity?: string; openai?: string; claude?: string }) {
    this.perplexityService = new PerplexityService({ apiKey: apiKeys?.perplexity });
    this.openAiService = new OpenAiService({ apiKey: apiKeys?.openai });
    this.claudeService = new ClaudeService({ apiKey: apiKeys?.claude });
    
    // Store Claude API key in localStorage if provided
    if (apiKeys?.claude) {
      localStorage.setItem('CLAUDE_API_KEY', apiKeys.claude);
      console.log("Claude API key saved to localStorage");
    }
    
    // Log the status of Claude API key
    console.log("Claude API key detected:", !!apiKeys?.claude);
  }
  
  async processTextWithAi(text: string, action: 'research' | 'critique' | 'expand'): Promise<AiResponse> {
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

// Create a singleton instance with API key from environment or local storage
let aiServiceManager: AiServiceManager;

export const getAiServiceManager = async (): Promise<AiServiceManager> => {
  if (aiServiceManager) {
    return aiServiceManager;
  }
  
  try {
    // Try to retrieve the API key from browser storage
    console.log("Attempting to retrieve Claude API key from browser storage");
    const apiKey = localStorage.getItem('CLAUDE_API_KEY');
    
    if (!apiKey) {
      console.warn("No Claude API key found in storage");
    } else {
      console.log("Claude API key retrieved from storage");
    }
    
    aiServiceManager = new AiServiceManager({
      claude: apiKey || undefined
    });
    
    return aiServiceManager;
  } catch (error) {
    console.error("Error initializing AI service:", error);
    // Create an instance without API key as fallback
    aiServiceManager = new AiServiceManager();
    return aiServiceManager;
  }
};
