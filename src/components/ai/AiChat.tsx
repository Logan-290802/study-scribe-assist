
import React, { useEffect, useState } from 'react';
import { Bot, Key } from 'lucide-react';
import ChatMessageList from './chat/ChatMessageList';
import ChatControls from './chat/ChatControls';
import { useAuth } from '@/store/AuthContext';
import { useAiChat } from '@/hooks/useAiChat';
import { AiChatProps } from './types';
import { aiServiceManager } from '@/services/ai/AiServiceManager';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const AiChat: React.FC<AiChatProps> = ({ 
  onAddReference, 
  onNewMessage, 
  documentId,
  chatHistory,
  onAddToKnowledgeBase
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hasClaudeKey, setHasClaudeKey] = useState<boolean>(false);
  
  useEffect(() => {
    // Check if Claude API key is available
    const claudeKey = localStorage.getItem('claude_api_key');
    setHasClaudeKey(!!claudeKey);
  }, []);
  
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

  // Handle navigating to API keys settings
  const handleGoToApiSettings = () => {
    navigate('/tools');
  };

  if (!user) {
    return (
      <div className="flex flex-col h-full border rounded-md overflow-hidden glass-card">
        <div className="p-3 border-b bg-gray-50/80 backdrop-blur-sm flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-500" />
          <h3 className="font-medium">AI Research Assistant</h3>
        </div>
        <div className="flex-grow flex items-center justify-center p-6 text-center">
          <div>
            <p className="text-gray-600 mb-4">Please sign in to use the AI research assistant</p>
          </div>
        </div>
      </div>
    );
  }

  if (!hasClaudeKey) {
    return (
      <div className="flex flex-col h-full border rounded-md overflow-hidden glass-card">
        <div className="p-3 border-b bg-gray-50/80 backdrop-blur-sm flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-500" />
          <h3 className="font-medium">AI Research Assistant</h3>
        </div>
        <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
          <Key className="w-8 h-8 text-blue-500 mb-3" />
          <h4 className="text-lg font-medium mb-2">Claude API Key Required</h4>
          <p className="text-gray-600 mb-4">
            To use the AI research assistant, please add your Claude API key in the settings.
          </p>
          <Button onClick={handleGoToApiSettings}>
            Configure API Key
          </Button>
          <p className="text-xs text-gray-500 mt-4">
            Get a key from <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Anthropic</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border rounded-md overflow-hidden glass-card">
      <div className="p-3 border-b bg-gray-50/80 backdrop-blur-sm flex items-center gap-2">
        <Bot className="w-5 h-5 text-blue-500" />
        <h3 className="font-medium">AI Research Assistant</h3>
      </div>
      
      <div className="flex-grow overflow-hidden h-[300px]">
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
