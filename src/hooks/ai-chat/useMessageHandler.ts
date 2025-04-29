
import { useToast } from '@/components/ui/use-toast';
import { ChatMessage } from '@/components/ai/types';
import { aiServiceManager } from '@/services/ai/AiServiceManager';
import { 
  createUserMessage, 
  createReferenceResponse, 
  createSummaryResponse, 
  createGeneralResponse,
  saveChatMessageToSupabase
} from './messageUtils';

interface UseMessageHandlerProps {
  documentId?: string;
  userId?: string;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  uploadedFile: File | null;
  setUploadedFile: React.Dispatch<React.SetStateAction<File | null>>;
  onNewMessage?: (message: string) => void;
}

export const useMessageHandler = ({
  documentId,
  userId,
  setMessages,
  setIsLoading,
  uploadedFile,
  setUploadedFile,
  onNewMessage
}: UseMessageHandlerProps) => {
  const { toast } = useToast();

  const handleSendMessage = async (input: string) => {
    if (!input.trim()) return;

    console.log('Sending message:', input);
    
    // Create and add user message to the UI
    const userMessage = createUserMessage(input);
    setMessages((prev) => [...prev, userMessage]);
    
    // Save user message to Supabase if documentId and userId exist
    if (documentId && userId) {
      await saveChatMessageToSupabase({
        role: 'user',
        content: input,
        document_id: documentId,
        user_id: userId,
      }, (error) => {
        console.error('Failed to save user message:', error);
        toast({
          title: "Error",
          description: "Failed to save chat message",
          variant: "destructive",
        });
      });
    }
    
    // If onNewMessage callback exists, use it but ALSO continue processing with AI
    if (onNewMessage) {
      console.log('Using onNewMessage callback');
      onNewMessage(input);
      // Continue to process with AI
    }
    
    // Set loading state to true when waiting for AI response
    setIsLoading(true);
    
    try {
      // Check if we have any API keys configured
      if (!aiServiceManager.hasAnyApiKey) {
        // Show a more helpful message if no API keys are configured
        toast({
          title: "API Key Required",
          description: "To use the AI assistant, please add your API key in the Tools section.",
          variant: "destructive",
          duration: 5000,
        });
        
        const noKeyMessage: ChatMessage = {
          id: Math.random().toString(36).substring(2, 9),
          role: 'assistant',
          content: "To use the AI assistant, please add your API key in the Tools section. You can get an API key from services like Anthropic (Claude), OpenAI, or Perplexity.",
          timestamp: new Date()
        };
        
        setMessages((prev) => [...prev, noKeyMessage]);
        setIsLoading(false);
        return;
      }
      
      console.log('Processing with AI: Claude API');
      // Use Claude AI for all interactions - explicitly using 'expand' action for consistent behavior
      const aiResult = await aiServiceManager.processTextWithAi(input, 'expand');
      
      console.log('AI Response received:', aiResult);
      
      if (!aiResult.content) {
        throw new Error('Empty response from AI service');
      }
      
      // Create AI response with the content from Claude
      const aiResponse: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        role: 'assistant',
        content: aiResult.content,
        timestamp: new Date()
      };
      
      // Add AI response to messages state
      setMessages((prev) => [...prev, aiResponse]);
      
      // If there's an uploaded file, clear it after processing
      if (uploadedFile) {
        setUploadedFile(null);
      }
      
      // Save the AI response to Supabase if documentId and userId exist
      if (documentId && userId) {
        await saveChatMessageToSupabase({
          role: 'assistant',
          content: aiResult.content,
          document_id: documentId,
          user_id: userId,
        }, (error) => {
          console.error('Failed to save AI response:', error);
          toast({
            title: "Error",
            description: "Failed to save chat message",
            variant: "destructive",
          });
        });
      }
    } catch (error) {
      console.error('Error processing AI request:', error);
      
      // Show error toast
      toast({
        title: "AI Error",
        description: "Failed to get a response from the AI service. Please check the console for details.",
        variant: "destructive",
      });
      
      // Add error message to chat
      const errorResponse: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        role: 'assistant',
        content: "Sorry, I encountered an error processing your request. Please try again later.",
        timestamp: new Date()
      };
      
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      // Always set loading to false when done
      setIsLoading(false);
    }
  };

  return {
    handleSendMessage
  };
};
