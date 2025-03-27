
import React from 'react';
import { Search, BookOpen, Bot } from 'lucide-react';

interface ChatActionsProps {
  onSearchClick: () => void;
  onCitationsClick: () => void;
  onSummarizeClick: () => void;
  disabled?: boolean;
}

export const ChatActions: React.FC<ChatActionsProps> = ({ 
  onSearchClick, 
  onCitationsClick, 
  onSummarizeClick,
  disabled = false
}) => {
  return (
    <div className="flex gap-1 mt-2 text-xs text-gray-500">
      <button 
        onClick={onSearchClick}
        className={`flex items-center gap-1 ${disabled ? 'text-gray-400 cursor-not-allowed' : 'hover:text-blue-500 transition-colors'}`}
        disabled={disabled}
      >
        <Search className="w-3 h-3" />
        Research
      </button>
      <span>•</span>
      <button 
        onClick={onCitationsClick}
        className={`flex items-center gap-1 ${disabled ? 'text-gray-400 cursor-not-allowed' : 'hover:text-blue-500 transition-colors'}`}
        disabled={disabled}
      >
        <BookOpen className="w-3 h-3" />
        Find Citations
      </button>
      <span>•</span>
      <button 
        onClick={onSummarizeClick}
        className={`flex items-center gap-1 ${disabled ? 'text-gray-400 cursor-not-allowed' : 'hover:text-blue-500 transition-colors'}`}
        disabled={disabled}
      >
        <Bot className="w-3 h-3" />
        Summarize
      </button>
    </div>
  );
};

export default ChatActions;
