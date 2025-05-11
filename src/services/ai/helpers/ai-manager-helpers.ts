
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

/**
 * Fetches the Claude API key from the Supabase Edge Function
 * 
 * @returns Promise with the API key or undefined
 */
export async function fetchClaudeApiKey(): Promise<string | undefined> {
  try {
    const { data, error } = await supabase.functions.invoke('get-claude-key');
    
    if (error) {
      console.error('Error fetching Claude API key:', error);
      return undefined;
    }
    
    if (data && data.apiKey) {
      console.log('Successfully fetched Claude API key from Supabase');
      return data.apiKey;
    }

    return undefined;
  } catch (error) {
    console.error('Exception while fetching Claude API key:', error);
    return undefined;
  }
}

/**
 * Helper method to wait for initialization with timeout
 * 
 * @param isInitialized Function that returns whether initialization is complete
 * @param timeoutMs Timeout in milliseconds
 * @returns Promise that resolves when initialized or rejects on timeout
 */
export function waitForInitialization(
  isInitialized: () => boolean, 
  timeoutMs: number = 5000
): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkInitialization = () => {
      if (isInitialized()) {
        resolve();
      } else if (Date.now() - startTime > timeoutMs) {
        reject(new Error('Initialization timeout'));
      } else {
        setTimeout(checkInitialization, 100);
      }
    };
    
    checkInitialization();
  });
}

/**
 * Displays a user-friendly error for AI service issues
 * 
 * @param error The error that occurred
 * @returns An AiResponse with user-friendly error message
 */
export function createServiceErrorResponse(error: unknown): { 
  content: string;
  error: string;
  source: string;
} {
  console.error('AI Service Error:', error);
  
  toast({
    title: "Claude API Error",
    description: "There was an issue connecting to Claude. Please try again later.",
    variant: "destructive",
  });
  
  return {
    content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
    error: error instanceof Error ? error.message : "Unknown error",
    source: "Claude (Error)"
  };
}
