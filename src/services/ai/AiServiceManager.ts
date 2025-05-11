
import { AiService, AiResponse } from './AiService';
import { PerplexityService } from './PerplexityService';
import { OpenAiService } from './OpenAiService';
import { ClaudeService } from './ClaudeService';
import { CriticalThinkingService, CriticalSuggestion } from './CriticalThinkingService';
import { toast } from '@/components/ui/use-toast';
import { fetchClaudeApiKey, waitForInitialization, createServiceErrorResponse } from './helpers/ai-manager-helpers';
import { ApiKeys, ChatHistoryMessage, ProcessTextOptions } from './types/ai-manager-types';

export class AiServiceManager {
  private perplexityService: PerplexityService;
  private openAiService: OpenAiService;
  private claudeService: ClaudeService;
  private criticalThinkingService: CriticalThinkingService;
  private isInitialized: boolean = false;
  
  // Temporary API key to use while we're fetching the real one
  private builtInClaudeKey: string = '';
  
  constructor(apiKeys?: ApiKeys) {
    console.log('Initializing AI Services');
    
    // Initialize with provided keys or temporarily with empty strings
    const claudeKey = apiKeys?.claude || this.builtInClaudeKey;
    console.log('Initial Claude key status:', claudeKey ? 'Key available' : 'No key available');
    
    this.perplexityService = new PerplexityService({ apiKey: apiKeys?.perplexity });
    this.openAiService = new OpenAiService({ apiKey: apiKeys?.openai });
    this.claudeService = new ClaudeService({ apiKey: claudeKey });
    
    // Use Claude key first, fall back to OpenAI if Claude isn't available
    this.criticalThinkingService = new CriticalThinkingService({ 
      apiKey: claudeKey || apiKeys?.openai 
    });
    
    // Fetch the real Claude API key from Supabase
    this.initializeWithApiKey();
  }
  
  private async initializeWithApiKey(): Promise<void> {
    const apiKey = await fetchClaudeApiKey();
    
    if (apiKey) {
      this.builtInClaudeKey = apiKey;
      
      // Reinitialize services with the fetched key
      this.claudeService = new ClaudeService({ apiKey: this.builtInClaudeKey });
      this.criticalThinkingService = new CriticalThinkingService({ 
        apiKey: this.builtInClaudeKey 
      });
      
      this.isInitialized = true;
      console.log('AI services reinitialized with fetched Claude API key');
    }
  }
  
  async processTextWithAi(text: string, action: 'research' | 'critique' | 'expand', chatHistory?: ChatHistoryMessage[]): Promise<AiResponse> {
    // Main processing logic based on action
    console.log(`Processing AI action: ${action} with text: ${text.substring(0, 50)}...`);
    console.log(`Chat history included: ${chatHistory ? chatHistory.length : 0} messages`);
    
    // If we haven't fetched the API key yet, wait a moment
    if (!this.isInitialized) {
      try {
        console.log('Waiting for API key initialization...');
        await waitForInitialization(() => this.isInitialized);
      } catch (error) {
        console.warn('Timed out waiting for API key, proceeding with current state');
      }
    }
    
    // Always use Claude with fetched key
    try {
      console.log('Using Claude service for request');
      return await this.claudeService.query(text, chatHistory);
    } catch (error) {
      return createServiceErrorResponse(error);
    }
  }
  
  async analyzeCriticalThinking(text: string): Promise<CriticalSuggestion[]> {
    return this.criticalThinkingService.analyzeText(text);
  }
  
  // Check if any API keys are configured
  get hasAnyApiKey(): boolean {
    return true;  // Always return true since we're fetching the key from Supabase
  }
  
  // Specifically check if Claude API is configured
  get hasClaudeApiKey(): boolean {
    return true;  // Always return true since we're fetching the key from Supabase
  }
  
  // Update API keys
  updateApiKeys(apiKeys: ApiKeys): void {
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
  
  /**
   * Process a file with AI (primarily Claude)
   * @param file The file to analyze
   * @param prompt Optional text prompt to guide analysis
   * @returns Promise with AI analysis results
   */
  async processFileWithAi(file: File, prompt?: string): Promise<AiResponse> {
    console.log(`Processing file with AI: ${file.name} (${file.type}, ${file.size} bytes)`);
    
    // If we haven't fetched the API key yet, wait a moment
    if (!this.isInitialized) {
      try {
        console.log('Waiting for API key initialization before file analysis...');
        await waitForInitialization(() => this.isInitialized);
      } catch (error) {
        console.warn('Timed out waiting for API key, proceeding with current state');
      }
    }
    
    // Use Claude for file processing
    try {
      console.log('Using Claude service for file analysis');
      return await this.claudeService.queryWithFile(file, prompt);
    } catch (error) {
      console.error('Error using Claude service for file analysis:', error);
      toast({
        title: "File Analysis Error",
        description: "There was an issue analyzing your file with Claude.",
        variant: "destructive",
      });
      
      // Return a user-friendly error
      return {
        content: "I'm sorry, I'm having trouble analyzing your file right now. This might be due to file size limits (32MB max) or a temporary issue with the Claude API.",
        error: error instanceof Error ? error.message : "Unknown error",
        source: "Claude (Error)"
      };
    }
  }
}

// Create a singleton instance
export const aiServiceManager = new AiServiceManager();
