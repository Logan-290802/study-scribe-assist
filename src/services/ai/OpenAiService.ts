
import { AiService, AiResponse, AiServiceOptions } from './AiService';

export class OpenAiService extends AiService {
  constructor(options?: AiServiceOptions) {
    super(options);
  }
  
  async query(text: string): Promise<AiResponse> {
    try {
      if (!this.apiKey) {
        return this.mockResponse(text);
      }
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful writing critique assistant. Analyze text for clarity, coherence, and effectiveness.'
            },
            {
              role: 'user',
              content: `Critique the following highlighted text: '${text}'. Analyze its clarity, logic, coherence, and effectiveness. Identify strengths, weaknesses, and suggest improvements.`
            }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        content: data.choices[0].message.content,
        source: 'OpenAI GPT'
      };
    } catch (error) {
      // Fall back to mock response if API call fails
      return this.mockResponse(text);
    }
  }
  
  // For development or when API key is not available
  private mockResponse(text: string): AiResponse {
    return {
      content: `Critique of "${text.substring(0, 30)}...":

Strengths:
• The text presents a clear main idea
• There's effective use of specific examples to support claims
• The language is generally appropriate for an academic context

Areas for improvement:
• The logical flow between paragraphs could be strengthened
• Some claims lack sufficient supporting evidence
• Consider varying sentence structure for better rhythm
• The conclusion could more explicitly connect to the initial thesis

Specific suggestions:
1. In the opening section, establish your thesis more explicitly
2. Add transitional phrases between major points
3. Provide additional evidence for the claim about [specific element]
4. Consider addressing potential counterarguments
5. Strengthen the conclusion by restating key points and their significance

Overall, this is a solid foundation that could be enhanced with these refinements to improve clarity, coherence, and persuasive impact.`,
      source: 'OpenAI GPT (Mock)'
    };
  }
}
