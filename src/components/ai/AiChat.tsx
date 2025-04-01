
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
  chatHistory 
}) => {
  const { user } = useAuth();
  
  const {
    messages,
    isLoading,
    uploadedPdf,
    setUploadedPdf,
    handleSendMessage,
    handleFileChange,
    addSampleReference
  } = useAiChat({
    documentId,
    userId: user?.id,
    onAddReference,
    externalChatHistory: chatHistory,
    onNewMessage
  });

  const handleSearchAction = () => {
    handleSendMessage("Can you help me research the latest findings on cognitive load theory?");
  };

  const handleCitationsAction = () => {
    handleSendMessage("Can you suggest some key references for my paper on educational psychology?");
  };

  const handleSummarizeAction = () => {
    handleSendMessage("Can you summarize the main theories of learning?");
  };

  return (
    <div className="flex flex-col h-full border rounded-md overflow-hidden glass-card">
      <div className="p-3 border-b bg-gray-50/80 backdrop-blur-sm flex items-center gap-2">
        <Bot className="w-5 h-5 text-blue-500" />
        <h3 className="font-medium">AI Research Assistant</h3>
      </div>
      
      <ChatMessageList
        messages={messages}
        isLoading={isLoading}
        uploadedPdf={uploadedPdf}
        onRemoveUploadedPdf={() => setUploadedPdf(null)}
        onAddReference={addSampleReference}
      />
      
      <ChatControls
        onSendMessage={handleSendMessage}
        onFileUpload={handleFileChange}
        isLoading={isLoading}
        isDisabled={!user}
        onSearchAction={handleSearchAction}
        onCitationsAction={handleCitationsAction}
        onSummarizeAction={handleSummarizeAction}
      />
    </div>
  );
};

export default AiChat;
