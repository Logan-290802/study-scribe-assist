
import { useState } from 'react';
import { ChatMessage, Reference } from '@/components/ai/types';
import { useFileUpload } from './ai-chat/useFileUpload';
import { useMessageHandler } from './ai-chat/useMessageHandler';
import { useReferenceHandler } from './ai-chat/useReferenceHandler';
import { convertFileToKnowledgeBaseItem } from '@/services/KnowledgeBaseService';

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

  // Initialize with external chat history if provided
  useState(() => {
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
    }
  });

  // File upload handling with knowledge base integration
  const handleAddFileToKnowledgeBase = async (filePath: string, fileType: string, fileName: string) => {
    if (onAddToKnowledgeBase && userId) {
      const knowledgeBaseItem = convertFileToKnowledgeBaseItem(filePath, fileType, fileName, userId);
      await onAddToKnowledgeBase(knowledgeBaseItem);
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
