
import { AiService, AiResponse } from './AiService';
import { PerplexityService } from './PerplexityService';
import { OpenAiService } from './OpenAiService';
import { ClaudeService } from './ClaudeService';
import { supabase } from '@/integrations/supabase/client';

export class AiServiceManager {
  private perplexityService: PerplexityService;
  private openAiService: OpenAiService;
  private claudeService: ClaudeService;
  
  constructor(apiKeys?: { perplexity?: string; openai?: string; claude?: string }) {
    this.perplexityService = new PerplexityService({ apiKey: apiKeys?.perplexity });
    this.openAiService = new OpenAiService({ apiKey: apiKeys?.openai });
    this.claudeService = new ClaudeService({ apiKey: apiKeys?.claude });
    
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

// Fetch the Claude API key from Supabase secrets
export const aiServiceManager = (async () => {
  const { data, error } = await supabase.functions.getSecret('CLAUDE_API_KEY');
  
  if (error) {
    console.error('Failed to retrieve Claude API key:', error);
    throw new Error('Claude API key retrieval failed');
  }

  return new AiServiceManager({
    claude: data?.secret
  });
})();

