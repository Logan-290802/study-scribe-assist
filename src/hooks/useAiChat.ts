
import { useState } from 'react';
import { ChatMessage, Reference } from '@/components/ai/types';
import { useFileUpload } from './ai-chat/useFileUpload';
import { useMessageHandler } from './ai-chat/useMessageHandler';
import { useReferenceHandler } from './ai-chat/useReferenceHandler';

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
