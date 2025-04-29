
import React from 'react';
import { Bot } from 'lucide-react';
import ChatMessageList from './chat/ChatMessageList';
import ChatControls from './chat/ChatControls';
import { useAuth } from '@/store/AuthContext';
import { useAiChat } from '@/hooks/useAiChat';
import { AiChatProps } from './types';

export const AiChat: React.FC<AiChatProps> = ({ 
  onAddReference, 
  onNewMessage, 
  documentId,
  chatHistory,
  onAddToKnowledgeBase
}) => {
  const { user } = useAuth();
  
  const {
    messages,
    isLoading,
    uploadedFile,
    setUploadedFile,
    handleSendMessage,
    handleFileChange,
    addSampleReference
  } = useAiChat({
    documentId,
    userId: user?.id,
    onAddReference,
    externalChatHistory: chatHistory,
    onNewMessage,
    onAddToKnowledgeBase
  });

  return (
    <div className="flex flex-col h-full border rounded-md overflow-hidden glass-card">
      <div className="p-3 border-b bg-gray-50/80 backdrop-blur-sm flex items-center gap-2">
        <Bot className="w-5 h-5 text-blue-500" />
        <h3 className="font-medium">AI Research Assistant</h3>
      </div>
      
      <div className="flex-grow overflow-hidden h-[calc(100vh-350px)]">
        <ChatMessageList
          messages={messages}
          isLoading={isLoading}
          uploadedFile={uploadedFile}
          onRemoveUploadedFile={() => setUploadedFile(null)}
          onAddReference={addSampleReference}
        />
      </div>
      
      <ChatControls
        onSendMessage={handleSendMessage}
        onFileUpload={handleFileChange}
        isLoading={isLoading}
        isDisabled={!user}
      />
    </div>
  );
};

export default AiChat;
