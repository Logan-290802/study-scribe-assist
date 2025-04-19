
import React, { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import UploadedFile from './UploadedFile';
import { ChatMessage as ChatMessageType } from '../types';
import { Loader } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ChatMessageListProps {
  messages: ChatMessageType[];
  isLoading: boolean;
  uploadedFile: File | null;
  onRemoveUploadedFile: () => void;
  onAddReference?: () => void;
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  isLoading,
  uploadedFile,
  onRemoveUploadedFile,
  onAddReference
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const hasApiKey = localStorage.getItem('CLAUDE_API_KEY') !== null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex-grow overflow-y-auto p-4 space-y-4 thin-scrollbar">
      {!hasApiKey && messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="bg-amber-50 p-6 rounded-lg mb-4 max-w-md">
            <div className="flex items-center justify-center mb-2">
              <Key className="h-5 w-5 text-amber-500 mr-2" />
              <h3 className="font-medium text-amber-800">API Key Required</h3>
            </div>
            <p className="text-amber-700 mb-4">
              You need to add a Claude API key to use the AI chat assistant.
            </p>
            <Button 
              variant="outline" 
              className="border-amber-300 hover:bg-amber-100"
              onClick={() => navigate('/tools')}
            >
              Add API Key
            </Button>
          </div>
        </div>
      )}

      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          id={message.id}
          role={message.role}
          content={message.content}
          timestamp={message.timestamp}
          onAddReference={message.role === 'assistant' && message.content.includes('reference') ? onAddReference : undefined}
        />
      ))}
      
      {isLoading && (
        <div className="flex flex-col justify-start animate-fade-in">
          <div className="bg-gray-100 text-gray-800 rounded-lg rounded-tl-none max-w-[85%] p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Loader className="w-5 h-5 text-blue-500 animate-spin" />
              <span className="text-sm text-gray-500">Anthropic's Claude is thinking...</span>
            </div>
            <Progress value={65} className="h-1.5 w-full" />
          </div>
        </div>
      )}
      
      {uploadedFile && (
        <UploadedFile 
          file={uploadedFile} 
          onRemove={onRemoveUploadedFile} 
        />
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessageList;
