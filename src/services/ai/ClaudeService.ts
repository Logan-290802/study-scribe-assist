import { AiService, AiResponse, AiServiceOptions } from './AiService';

export class ClaudeService extends AiService {
  constructor(options?: AiServiceOptions) {
    super(options);
  }
  
  async query(text: string): Promise<AiResponse> {
    try {
      if (!this.apiKey) {
        return this.mockResponse(text);
      }
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          messages: [
            {
              role: 'system',
              content: 'You are a creative, thoughtful idea developer who helps writers expand concepts and ideas. Your role is to take a seed concept and develop it into a rich, well-rounded exploration. You should maintain the original intent while adding depth, nuance, relevant examples, different perspectives, historical context, practical applications, and thought-provoking extensions. Organize your response in a clear structure with headings, and ensure the expanded content remains coherent, relevant, and builds meaningfully on the original idea.'
            },
            {
              role: 'user',
              content: text
            }
          ],
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        content: data.content[0].text,
        source: 'Anthropic Claude'
      };
    } catch (error) {
      console.error('Error in Claude service:', error);
      // Fall back to mock response if API call fails
      return this.mockResponse(text);
    }
  }
  
  // For development or when API key is not available
  private mockResponse(text: string): AiResponse {
    return {
      content: `# Expanded Exploration: "${text.substring(0, 30)}..."

## Core Principles & Underlying Assumptions

This concept fundamentally rests on several key principles:
- The relationship between [principle 1] and [principle 2]
- The assumption that [key assumption]
- The underlying value of [core value]

These elements form the foundation upon which this idea is built. The interplay between [element 1] and [element 2] creates a dynamic tension that makes this concept particularly rich for exploration.

## Historical Context & Evolution

This idea has roots that can be traced to:
- Early formulations in [historical period/movement], when [historical figure/group] first proposed similar concepts
- Important developments during [middle period], particularly through the work of [key contributors]
- Contemporary evolution through [recent developments] and the influence of [modern field/discipline]

The progression from [earlier form] to [current understanding] demonstrates how the concept has adapted to changing contexts while maintaining its essential character.

## Different Perspectives & Interpretations

Various schools of thought offer distinct interpretations:
- The [Perspective A] approach emphasizes [key aspect 1], suggesting that [interpretation 1]
- From a [Perspective B] standpoint, the focus shifts to [key aspect 2], leading to [interpretation 2]
- [Interdisciplinary perspective] bridges these views by recognizing [connecting element]

These diverse viewpoints enrich our understanding by highlighting different dimensions of the same fundamental concept.

## Examples & Applications

This concept manifests concretely through:
- In [domain 1]: [specific example 1] demonstrates how [principle] operates in practice
- In [domain 2]: Organizations like [example organization] have applied this thinking to [practical application]
- In everyday contexts: [relatable example] shows how this idea appears in common experiences

These examples illustrate the versatility and practical relevance of the concept across different contexts.

## Implications & Extensions

The broader implications include:
- Potential impact on [related field/issue], particularly regarding [specific impact]
- Extension of these principles to [new domain], which could lead to [innovative outcome]
- Long-term consequences for [broader system], especially considering [emerging trend]

These ripple effects demonstrate the concept's significance beyond its immediate applications.

## Potential Limitations & Criticisms

Important challenges to consider include:
- The problem of [limitation 1], which raises questions about [specific concern]
- Critics from [opposing perspective] who argue that [counter-argument]
- Practical constraints related to [implementation challenge]

Acknowledging these limitations provides a more balanced understanding and identifies areas for further refinement.

## Related Concepts Worth Exploring

This idea connects meaningfully to:
- [Related concept 1], which shares [common element] but differs in [key distinction]
- The broader framework of [larger theoretical approach]
- Emerging ideas around [cutting-edge related concept]

Exploring these connections could yield even richer insights and applications of the core concept.

## Synthesis & Next Steps

Drawing these threads together, we see that this idea represents [synthesized understanding]. Moving forward, fruitful directions might include:
- Deeper exploration of [specific aspect]
- Application of these principles to [new context]
- Integration with [complementary framework]

This expanded understanding transforms the initial concept from a single point into a rich constellation of interconnected ideas, applications, and possibilities.`,
      source: 'Anthropic Claude (Mock)'
    };
  }
}
