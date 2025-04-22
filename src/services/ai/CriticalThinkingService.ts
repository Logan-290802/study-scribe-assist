
import { AiService, AiResponse, AiServiceOptions } from './AiService';

export interface CriticalSuggestion {
  id: string;
  text: string;
  suggestion: string;
  type: 'clarity' | 'logic' | 'evidence' | 'structure';
  position: { from: number; to: number };
}

export class CriticalThinkingService extends AiService {
  constructor(options?: AiServiceOptions) {
    super(options);
  }
  
  async analyzeText(text: string): Promise<CriticalSuggestion[]> {
    try {
      // Use the AI service to analyze the text
      const response = await this.query(text);
      
      // Parse the response to extract suggestions
      return this.parseSuggestions(response.content, text);
    } catch (error) {
      console.error('Error analyzing text:', error);
      return [];
    }
  }
  
  async query(text: string): Promise<AiResponse> {
    try {
      if (!this.apiKey) {
        return this.mockResponse(text);
      }
      
      // Implement the AI query - this would normally call an AI API
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1000,
          temperature: 0.2,
          system: "You are a critical thinking assistant that analyzes text and provides specific suggestions for improvement. For each issue you find, identify the specific text span, the type of issue (clarity, logic, evidence, or structure), and provide a concrete suggestion for improvement. Format your response as JSON objects, each containing 'text' (the problematic text), 'type' (the issue type), and 'suggestion' (your proposed improvement).",
          messages: [{
            role: 'user',
            content: `Analyze the following text for areas that could benefit from critical thinking improvements:\n\n${text}\n\nProvide specific suggestions formatted as JSON objects.`
          }]
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        content: data.content && data.content[0] && data.content[0].text ? data.content[0].text : '[]',
        source: 'Critical Thinking Assistant'
      };
    } catch (error) {
      // Fall back to mock response if API call fails
      return this.mockResponse(text);
    }
  }
  
  private parseSuggestions(responseContent: string, originalText: string): CriticalSuggestion[] {
    try {
      // Extract JSON objects from the response
      const jsonContent = responseContent.match(/\[.*?\]/s)?.[0] || '[]';
      const suggestions = JSON.parse(jsonContent);
      
      // Map each suggestion to include a position and ID
      return suggestions.map((item: any, index: number) => {
        const text = item.text || '';
        const position = this.findTextPosition(originalText, text);
        
        return {
          id: `suggestion-${index}`,
          text: text,
          suggestion: item.suggestion || '',
          type: item.type || 'clarity',
          position: position
        };
      });
    } catch (error) {
      console.error('Error parsing suggestions:', error);
      return [];
    }
  }
  
  private findTextPosition(content: string, text: string): { from: number; to: number } {
    const index = content.indexOf(text);
    if (index !== -1) {
      return {
        from: index,
        to: index + text.length
      };
    }
    return { from: 0, to: 0 };
  }
  
  // Mock response for development or when API key is not available
  private mockResponse(text: string): AiResponse {
    const mockSuggestions = [
      {
        text: text.substring(10, 30),
        type: "clarity",
        suggestion: "Consider rephrasing this sentence to be more direct and specific."
      },
      {
        text: text.substring(50, 80),
        type: "evidence",
        suggestion: "This claim would be stronger with specific examples or data to support it."
      },
      {
        text: text.substring(100, 130),
        type: "logic",
        suggestion: "There appears to be a logical gap between this statement and your previous point."
      }
    ];
    
    return {
      content: JSON.stringify(mockSuggestions),
      source: 'Critical Thinking Assistant (Mock)'
    };
  }
}

// Add it to the AI service manager
export const criticalThinkingService = new CriticalThinkingService();
