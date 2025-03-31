
import { AiService, AiResponse, AiServiceOptions } from './AiService';

export class PerplexityService extends AiService {
  constructor(options?: AiServiceOptions) {
    super(options);
  }
  
  async query(text: string): Promise<AiResponse> {
    try {
      if (!this.apiKey) {
        return this.mockResponse(text);
      }
      
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful research assistant. Provide accurate, well-sourced information with citations.'
            },
            {
              role: 'user',
              content: `Research the following highlighted text and provide relevant information, sources, and context: '${text}'. Summarize key findings and cite sources where possible.`
            }
          ],
          temperature: 0.2,
          top_p: 0.9,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        content: data.choices[0].message.content,
        source: 'Perplexity AI'
      };
    } catch (error) {
      // Fall back to mock response if API call fails
      return this.mockResponse(text);
    }
  }
  
  // For development or when API key is not available
  private mockResponse(text: string): AiResponse {
    return {
      content: `Research findings for "${text.substring(0, 30)}...": 
      
According to recent studies, this concept has been explored in multiple academic papers. Smith et al. (2022) found significant correlations between these factors, while Johnson's research (2021) highlights alternative interpretations.

Key findings:
• The concept has historical roots dating back to the 1980s
• Recent technological developments have transformed understanding
• Multiple perspectives exist on its practical applications
• Ongoing research continues to refine the theoretical framework

Sources:
1. Smith, J. et al. (2022). "Comprehensive Analysis of Conceptual Frameworks." Journal of Applied Research, 15(2), 112-128.
2. Johnson, T. (2021). "Alternative Perspectives on Theoretical Applications." Academic Review, 33(4), 78-95.
3. International Research Foundation (2023). "State of the Field Report." Retrieved from: https://example.org/research/report2023`,
      source: 'Perplexity AI (Mock)'
    };
  }
}
