
import { useState, useEffect } from 'react';
import { ChatMessage, Reference } from '@/components/ai/types';
import { useFileUpload } from './ai-chat/useFileUpload';
import { useMessageHandler } from './ai-chat/useMessageHandler';
import { useReferenceHandler } from './ai-chat/useReferenceHandler';
import { convertFileToKnowledgeBaseItem } from '@/services/KnowledgeBaseService';
import { aiServiceManager } from '@/services/ai/AiServiceManager';
import { toast } from '@/components/ui/use-toast';

interface UseAiChatProps {
  documentId?: string;
  userId?: string;
  onAddReference?: (reference: Reference) => void;
  externalChatHistory?: { role: 'user' | 'assistant'; content: string }[];
  onNewMessage?: (message: string) => void;
  onAddToKnowledgeBase?: (item: any) => Promise<any>;
}

export const useAiChat = ({
  documentId,
  userId,
  onAddReference,
  externalChatHistory,
  onNewMessage,
  onAddToKnowledgeBase
}: UseAiChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize with external chat history or welcome message if provided
  useEffect(() => {
    if (externalChatHistory && externalChatHistory.length > 0) {
      const convertedMessages = externalChatHistory.map((item, index) => ({
        id: index.toString(),
        role: item.role,
        content: item.content,
        timestamp: new Date()
      }));
      
      if (convertedMessages.length > 0) {
        setMessages(convertedMessages);
      }
    } else if (!externalChatHistory?.length) {
      // Only add welcome message if there's no history
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: "Hello! I'm your AI research assistant powered by Claude. How can I help with your academic or research needs today?",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [externalChatHistory]);

  // File upload handling with knowledge base integration
  const handleAddFileToKnowledgeBase = async (item: any) => {
    console.log('handleAddFileToKnowledgeBase called with item:', item);
    if (onAddToKnowledgeBase && userId) {
      try {
        console.log('Calling onAddToKnowledgeBase from useAiChat');
        const result = await onAddToKnowledgeBase(item);
        console.log('Knowledge base add result:', result);
        return result;
      } catch (error) {
        console.error('Error in handleAddFileToKnowledgeBase:', error);
        toast({
          title: "Error adding to knowledge base",
          description: "Failed to add the file to your knowledge base.",
          variant: "destructive",
        });
        return null;
      }
    }
  };

  const { 
    uploadedFile, 
    setUploadedFile, 
    handleFileChange 
  } = useFileUpload({
    documentId,
    userId,
    setMessages,
    setIsLoading,
    onAddToKnowledgeBase: handleAddFileToKnowledgeBase
  });

  // Message handling
  const { handleSendMessage } = useMessageHandler({
    documentId,
    userId,
    setMessages,
    setIsLoading,
    uploadedFile,
    setUploadedFile,
    onNewMessage
  });

  // Reference handling
  const { addSampleReference } = useReferenceHandler({
    documentId,
    userId,
    setMessages,
    onAddReference
  });

  return {
    messages,
    isLoading,
    uploadedFile,
    setUploadedFile,
    handleSendMessage,
    handleFileChange,
    addSampleReference
  };
};
