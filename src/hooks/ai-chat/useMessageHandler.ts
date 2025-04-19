
import { useToast } from '@/components/ui/use-toast';
import { ChatMessage } from '@/components/ai/types';
import { Progress } from '@/components/ui/progress';
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

    // Create and add user message
    const userMessage = createUserMessage(input);
    setMessages((prev) => [...prev, userMessage]);
    
    console.log("Sending user message:", input);
    
    // Save user message to Supabase if available
    if (documentId && userId) {
      await saveChatMessageToSupabase({
        role: 'user',
        content: input,
        document_id: documentId,
        user_id: userId,
      }, (error) => {
        toast({
          title: "Error",
          description: "Failed to save chat message",
          variant: "destructive",
        });
      });
    }
    
    // If we have an external handler, use that instead
    if (onNewMessage) {
      onNewMessage(input);
      return;
    }
    
    // Set loading state to true when waiting for AI response
    setIsLoading(true);
    console.log("Loading state set to true, waiting for AI response");
    
    try {
      console.log("Calling Claude AI service...");
      // Use Claude AI for all interactions
      const aiResult = await aiServiceManager.processTextWithAi(input, 'expand');
      console.log("AI response received:", aiResult);
      
      // Create AI response with the content from Claude
      const aiResponse: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        role: 'assistant',
        content: aiResult.content,
        timestamp: new Date()
      };
      
      setMessages((prev) => [...prev, aiResponse]);
      console.log("AI message added to chat");
      
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
        description: "Failed to get a response from Claude. Please try again.",
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
      console.log("Loading state set to false, AI response complete");
    }
  };

  return {
    handleSendMessage
  };
};
