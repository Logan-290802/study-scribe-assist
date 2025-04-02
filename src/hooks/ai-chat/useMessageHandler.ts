
import { useToast } from '@/components/ui/use-toast';
import { ChatMessage } from '@/components/ai/types';
import { KnowledgeBaseReference } from '@/types/knowledgeBase.types';
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
  knowledgeBaseReferences?: KnowledgeBaseReference[];
}

export const useMessageHandler = ({
  documentId,
  userId,
  setMessages,
  setIsLoading,
  uploadedFile,
  setUploadedFile,
  onNewMessage,
  knowledgeBaseReferences = []
}: UseMessageHandlerProps) => {
  const { toast } = useToast();

  const handleSendMessage = async (input: string) => {
    if (!input.trim()) return;

    const userMessage = createUserMessage(input);
    setMessages((prev) => [...prev, userMessage]);
    
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
    
    if (onNewMessage) {
      onNewMessage(input);
      return;
    }
    
    setIsLoading(true);
    
    setTimeout(() => {
      let aiResponse: ChatMessage;
      
      if (input.toLowerCase().includes('reference') || input.toLowerCase().includes('citation')) {
        // Use knowledge base references if available
        if (knowledgeBaseReferences && knowledgeBaseReferences.length > 0) {
          // Sort by most recently added
          const recentRefs = [...knowledgeBaseReferences]
            .sort((a, b) => b.date_added.getTime() - a.date_added.getTime())
            .slice(0, 2);
            
          const refsContent = recentRefs.map(ref => {
            const authors = ref.authors.length > 0 
              ? ref.authors.join(', ') 
              : 'Unknown';
            return `${authors} (${ref.year}). "${ref.title}". ${ref.type === 'journal' ? ref.discipline : ref.type}.`;
          }).join('\n\n');
          
          aiResponse = createReferenceResponse(refsContent);
        } else {
          aiResponse = createReferenceResponse();
        }
      } else if (input.toLowerCase().includes('summarize') || input.toLowerCase().includes('summary')) {
        aiResponse = createSummaryResponse();
      } else if (uploadedFile) {
        // This case is handled by useFileUpload now
        aiResponse = createGeneralResponse();
        setUploadedFile(null);
      } else {
        aiResponse = createGeneralResponse();
      }
      
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
      
      if (documentId && userId) {
        saveChatMessageToSupabase({
          role: 'assistant',
          content: aiResponse.content,
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
    }, 1500);
  };

  return {
    handleSendMessage
  };
};
