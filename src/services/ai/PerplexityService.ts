
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
              content: 'You are a scholarly research assistant with expertise in finding accurate, well-sourced information. When presented with a topic or question, provide comprehensive research with factual information, key concepts, historical context, different perspectives, and current developments. Always cite your sources clearly with authors, publication dates, and accessible links where available.'
            },
            {
              role: 'user',
              content: `Research the following topic thoroughly and provide comprehensive information: '${text}'. Include: 
              - Key concepts and definitions
              - Historical context and development
              - Major scholarly perspectives 
              - Recent research findings
              - Practical applications or implications
              
              Organize your response clearly and cite all sources properly.`
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
      
## Key Concepts
- The concept of ${text} has its roots in [specific field/discipline]
- It encompasses several core principles including [principle 1], [principle 2], and [principle 3]
- The fundamental framework was established by [historical figure/researcher] in [year]

## Historical Development
- Early work began in the [decade/period] when [historical context]
- A significant breakthrough occurred in [year] when [researcher] published [important finding]
- The field evolved through three distinct phases: [phase 1] (years), [phase 2] (years), and [phase 3] (years)

## Major Scholarly Perspectives
- The [Name] School of thought argues that [perspective 1]
- In contrast, [Alternative] theorists propose that [perspective 2]
- Recent interdisciplinary approaches suggest [perspective 3]

## Current Research
- Smith et al. (2023) found that [recent finding 1]
- Jones and Zhang (2022) demonstrated [recent finding 2]
- Ongoing work at [institution] is exploring [cutting-edge direction]

## Applications & Implications
- This concept has been applied successfully in [field 1] to [specific application]
- Potential future applications include [emerging application]
- Ethical considerations include [consideration 1] and [consideration 2]

## Sources
1. Smith, J. et al. (2023). "Comprehensive Analysis of [Topic]." Journal of [Field], 15(2), 112-128. https://doi.org/10.xxxx/xxxxx
2. Jones, T. & Zhang, L. (2022). "[Title of Paper]." [Journal], 33(4), 78-95. https://doi.org/10.xxxx/xxxxx
3. [Historical Figure] (Year). "[Title of Seminal Work]." [Publisher].
4. [Institution] Research Group (2023). "[Report Title]." Retrieved from: https://institution.edu/research`,
      source: 'Perplexity AI (Mock)'
    };
  }
}
