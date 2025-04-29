
// Base interface for AI responses
export interface AiResponse {
  content: string;
  source?: string;
  error?: string;
}

// Base interface for AI service options
export interface AiServiceOptions {
  apiKey?: string;
}

// Abstract class for all AI services
export abstract class AiService {
  protected apiKey?: string;
  
  constructor(options?: AiServiceOptions) {
    this.apiKey = options?.apiKey;
  }
  
  // Abstract method to be implemented by each service
  abstract query(prompt: string): Promise<AiResponse>;
  
  // Helper method to format error responses
  protected formatError(error: any): AiResponse {
    console.error(`AI Service Error:`, error);
    return {
      content: "Sorry, I encountered an error while processing your request. Please try again later.",
      error: error.message || "Unknown error"
    };
  }
  
  // Check if the service has a valid API key
  get hasApiKey(): boolean {
    return !!this.apiKey;
  }
}
