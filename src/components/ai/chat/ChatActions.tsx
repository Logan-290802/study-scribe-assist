
import React from 'react';
import { Search, BookOpen, Bot } from 'lucide-react';

interface ChatActionsProps {
  onSearchClick: () => void;
  onCitationsClick: () => void;
  onSummarizeClick: () => void;
}

export const ChatActions: React.FC<ChatActionsProps> = ({ 
  onSearchClick, 
  onCitationsClick, 
  onSummarizeClick 
}) => {
  return (
    <div className="flex gap-1 mt-2 text-xs text-gray-500">
      <button 
        onClick={onSearchClick}
        className="flex items-center gap-1 hover:text-blue-500 transition-colors"
      >
        <Search className="w-3 h-3" />
        Research
      </button>
      <span>•</span>
      <button 
        onClick={onCitationsClick}
        className="flex items-center gap-1 hover:text-blue-500 transition-colors"
      >
        <BookOpen className="w-3 h-3" />
        Find Citations
      </button>
      <span>•</span>
      <button 
        onClick={onSummarizeClick}
        className="flex items-center gap-1 hover:text-blue-500 transition-colors"
      >
        <Bot className="w-3 h-3" />
        Summarize
      </button>
    </div>
  );
};

export default ChatActions;
