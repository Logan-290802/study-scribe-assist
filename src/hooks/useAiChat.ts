
import { useState, useEffect } from 'react';
import { ChatMessage, Reference } from '@/components/ai/types';
import { useFileUpload } from './ai-chat/useFileUpload';
import { useMessageHandler } from './ai-chat/useMessageHandler';
import { useReferenceHandler } from './ai-chat/useReferenceHandler';
import { useKnowledgeBaseStore } from '@/store/KnowledgeBaseStore';

interface UseAiChatProps {
  documentId?: string;
  userId?: string;
  onAddReference?: (reference: Reference) => void;
  externalChatHistory?: { role: 'user' | 'assistant'; content: string }[];
  onNewMessage?: (message: string) => void;
}

export const useAiChat = ({
  documentId,
  userId,
  onAddReference,
  externalChatHistory,
  onNewMessage
}: UseAiChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { references: knowledgeBaseReferences } = useKnowledgeBaseStore();

  // Initialize with external chat history if provided
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
    }
  }, [externalChatHistory]);

  // File upload handling
  const { 
    uploadedFile, 
    setUploadedFile, 
    handleFileChange 
  } = useFileUpload({
    documentId,
    userId,
    setMessages,
    setIsLoading
  });

  // Message handling
  const { handleSendMessage } = useMessageHandler({
    documentId,
    userId,
    setMessages,
    setIsLoading,
    uploadedFile,
    setUploadedFile,
    onNewMessage,
    knowledgeBaseReferences
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
