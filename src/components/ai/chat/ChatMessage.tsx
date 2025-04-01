
import React from 'react';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  onAddReference?: () => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ 
  id, 
  role, 
  content, 
  timestamp,
  onAddReference
}) => {
  return (
    <div
      key={id}
      className={cn(
        "flex animate-fade-in",
        role === 'user' ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-lg p-3",
          role === 'user' 
            ? "bg-blue-500 text-white rounded-tr-none" 
            : "bg-gray-100 text-gray-800 rounded-tl-none"
        )}
      >
        <div className="whitespace-pre-line">{content}</div>
        
        <div className="text-xs mt-1 opacity-70">
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
