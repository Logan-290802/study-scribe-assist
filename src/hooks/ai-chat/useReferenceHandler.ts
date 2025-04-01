
import { useToast } from '@/components/ui/use-toast';
import { Reference } from '@/components/ai/types';
import { 
  createSampleReference, 
  createReferenceAddedMessage,
  saveChatMessageToSupabase
} from './messageUtils';

interface UseReferenceHandlerProps {
  documentId?: string;
  userId?: string;
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  onAddReference?: (reference: Reference) => void;
}

export const useReferenceHandler = ({
  documentId,
  userId,
  setMessages,
  onAddReference
}: UseReferenceHandlerProps) => {
  const { toast } = useToast();

  const addSampleReference = () => {
    if (!onAddReference) return;
    
    const newReference = createSampleReference();
    onAddReference(newReference);
    
    const confirmationMessage = createReferenceAddedMessage();
    setMessages((prev) => [...prev, confirmationMessage]);
    
    if (userId && documentId) {
      saveChatMessageToSupabase({
        role: 'assistant',
        content: confirmationMessage.content,
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
  };

  return {
    addSampleReference
  };
};
