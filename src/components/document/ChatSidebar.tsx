
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AiChat, Reference } from '@/components/ai';
import { useDocuments } from '@/store/DocumentStore';
import { KnowledgeBaseItem, convertFileToKnowledgeBaseItem } from '@/services/KnowledgeBaseService';

interface ChatSidebarProps {
  documentId: string;
  onAddReference: (reference: Reference) => void;
  chatHistory: { role: 'user' | 'assistant'; content: string }[];
  setChatHistory: React.Dispatch<React.SetStateAction<{ role: 'user' | 'assistant'; content: string }[]>>;
  userId?: string;
  onAddToKnowledgeBase?: (item: any) => Promise<any>;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  documentId,
  onAddReference,
  chatHistory,
  setChatHistory,
  userId,
  onAddToKnowledgeBase
}) => {
  const { addKnowledgeBaseItem } = useDocuments();
  
  const handleNewMessage = (message: string) => {
    // We'll rely on the useChatHistory hook to manage state and database operations
    // This simply passes the message to the parent component
    const newMessage = { role: 'user' as const, content: message };
    setChatHistory([...chatHistory, newMessage]);
  };

  // Function to handle file uploads and add to knowledge base
  const handleAddToKnowledgeBase = async (item: any) => {
    if (!userId || !addKnowledgeBaseItem) return;
    
    const { filePath, fileType, fileName } = item;
    
    const knowledgeBaseItem = convertFileToKnowledgeBaseItem(filePath, fileType, fileName, userId);
    await addKnowledgeBaseItem(knowledgeBaseItem);
    
    // Also call the original onAddToKnowledgeBase if provided
    if (onAddToKnowledgeBase) {
      await onAddToKnowledgeBase(item);
    }
  };

  return (
    <Card className="h-[450px] sticky top-24">
      <CardContent className="p-4 h-full flex flex-col">
        <AiChat
          onAddReference={onAddReference}
          documentId={documentId}
          onNewMessage={handleNewMessage}
          chatHistory={chatHistory}
          onAddToKnowledgeBase={handleAddToKnowledgeBase}
        />
      </CardContent>
    </Card>
  );
};

export default ChatSidebar;
