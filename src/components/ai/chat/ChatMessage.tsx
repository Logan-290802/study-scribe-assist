
import React from 'react';
import { BookText, Clipboard } from 'lucide-react';
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
  const containsReference = content.includes('reference');

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
        {content}
        
        {role === 'assistant' && containsReference && onAddReference && (
          <div className="mt-2 flex gap-2">
            <button 
              onClick={onAddReference}
              className="text-xs py-1 px-2 bg-white text-blue-600 rounded border border-blue-200 hover:bg-blue-50 transition-colors flex items-center gap-1"
            >
              <BookText className="w-3 h-3" />
              Add to References
            </button>
            <button className="text-xs py-1 px-2 bg-white text-gray-600 rounded border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-1">
              <Clipboard className="w-3 h-3" />
              Copy
            </button>
          </div>
        )}
        
        <div className="text-xs mt-1 opacity-70">
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
