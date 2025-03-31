
import React, { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import UploadedFile from './UploadedFile';
import { Message } from '../types';

interface ChatMessageListProps {
  messages: Message[];
  isLoading: boolean;
  uploadedPdf: File | null;
  onRemoveUploadedPdf: () => void;
  onAddReference?: () => void;
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  isLoading,
  uploadedPdf,
  onRemoveUploadedPdf,
  onAddReference
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        <div className="flex justify-start animate-fade-in">
          <div className="bg-gray-100 text-gray-800 rounded-lg rounded-tl-none max-w-[85%] p-3">
            <div className="flex space-x-2">
              <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      )}
      
      {uploadedPdf && (
        <UploadedFile 
          file={uploadedPdf} 
          onRemove={onRemoveUploadedPdf} 
        />
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessageList;
