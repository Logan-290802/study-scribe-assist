
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
              content: 'You are an expert writing coach with a background in rhetoric, composition, and effective communication. Your role is to provide detailed, constructive critiques that help writers improve their work. Analyze writing for clarity, coherence, logical structure, persuasiveness, and stylistic effectiveness. Be specific in your feedback, pointing to exact elements that work well or need improvement. Your goal is to help the writer meaningfully improve their text while maintaining their voice and intent.'
            },
            {
              role: 'user',
              content: `Provide a thorough critique of the following text:

'${text}'

Please analyze:
1. Clarity & Coherence: Is the message clear? Does the text flow logically?
2. Structure & Organization: Is the information effectively organized?
3. Evidence & Support: Are claims adequately supported?
4. Language & Style: Is the tone appropriate? Are there stylistic issues?
5. Impact & Effectiveness: Does the text achieve its apparent purpose?

For each area of analysis, identify specific strengths and weaknesses, providing examples directly from the text. Conclude with 3-5 actionable, prioritized recommendations for improvement.`
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
      content: `# Critique of "${text.substring(0, 30)}..."

## Clarity & Coherence
**Strengths:**
- The main argument about [topic] is clearly stated in the opening
- Key terms are defined appropriately for the audience
- Paragraphs generally have clear topic sentences

**Areas for Improvement:**
- The transition between paragraph 2 and 3 is abrupt, creating a logical gap
- The connection between [concept A] and [concept B] needs more explicit development
- The concluding statement introduces a new idea rather than synthesizing presented points

## Structure & Organization
**Strengths:**
- The text follows a logical progression from [starting point] to [conclusion]
- Section headings (if present) effectively signal content
- The introduction effectively establishes context and significance

**Areas for Improvement:**
- Consider reversing the order of paragraphs [X] and [Y] for stronger logical flow
- The discussion of [supporting point] would be more effective earlier in the text
- Some supporting points receive disproportionate attention compared to their importance

## Evidence & Support
**Strengths:**
- Specific examples effectively illustrate the concept of [main idea]
- Statistical data is appropriately cited and relevant
- Counter-arguments are acknowledged fairly

**Areas for Improvement:**
- The claim about [specific point] lacks supporting evidence
- Some generalizations would benefit from specific examples
- Consider incorporating more diverse perspectives on [contested topic]

## Language & Style
**Strengths:**
- Vocabulary is appropriately sophisticated for the apparent audience
- Sentence structure varies effectively
- Active voice is used appropriately in most cases

**Areas for Improvement:**
- Several instances of passive voice weaken impact (e.g., "it was determined that...")
- Some sentences exceed 30 words, creating comprehension challenges
- Technical jargon like [specific term] may need definition for this audience

## Impact & Effectiveness
**Strengths:**
- The opening effectively engages reader interest
- The conclusion successfully reinforces the main argument
- The tone appropriately balances authority with accessibility

**Areas for Improvement:**
- The stakes or significance of this topic could be more explicitly stated
- The call to action lacks specificity about next steps
- Consider strengthening emotional appeal to complement logical arguments

## Prioritized Recommendations
1. Strengthen the transition between paragraphs 2-3 by explicitly connecting [concept A] and [concept B]
2. Add specific supporting evidence for the claim about [specific point]
3. Revise the conclusion to synthesize main points rather than introducing new ideas
4. Convert passive constructions to active voice, particularly in the section on [topic]
5. Consider adding a more specific call to action that gives readers clear next steps

This text has solid foundational elements but would benefit from these targeted revisions to enhance clarity, logical flow, and overall impact.`,
      source: 'OpenAI GPT (Mock)'
    };
  }
}
