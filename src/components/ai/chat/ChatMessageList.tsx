
import React, { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import UploadedFile from './UploadedFile';
import { ChatMessage as ChatMessageType } from '../types';
import { Loader } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex-grow overflow-y-auto p-4 space-y-4 thin-scrollbar">
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
