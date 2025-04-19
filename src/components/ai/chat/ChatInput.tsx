
import React, { useRef, useEffect } from 'react';
import { SendHorizontal, Upload, Key } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatInput } from '@/contexts/ChatInputContext';
import { useNavigate } from 'react-router-dom';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onUploadFile: () => void;
  isLoading: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  onUploadFile, 
  isLoading,
  disabled = false,
  placeholder = "Ask your AI research assistant..."
}) => {
  const { inputValue, setInputValue } = useChatInput();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();
  const hasApiKey = localStorage.getItem('CLAUDE_API_KEY') !== null;
  
  const noApiKeyMessage = "Claude API key required - click to configure";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || disabled || !hasApiKey) return;
    
    onSendMessage(inputValue);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Navigate to API key configuration page if clicked when no key is present
  const handleNoApiKeyClick = () => {
    if (!hasApiKey) {
      navigate('/tools');
    }
  };

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    
    // Set the height based on scrollHeight, with a max of 4 lines (approximately 100px)
    const newHeight = Math.min(textarea.scrollHeight, 100);
    textarea.style.height = `${newHeight}px`;
  }, [inputValue]);

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="flex-grow relative">
        <textarea
          ref={textareaRef}
          value={!hasApiKey ? noApiKeyMessage : inputValue}
          onChange={(e) => hasApiKey && setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={hasApiKey ? placeholder : ""}
          rows={1}
          className={cn(
            "w-full p-2 border rounded-md bg-white/80 focus:outline-none focus:ring-1 resize-none overflow-y-auto",
            hasApiKey ? "focus:ring-blue-500" : "focus:ring-amber-500 text-amber-700 cursor-pointer"
          )}
          disabled={isLoading || disabled || !hasApiKey}
          style={{ minHeight: '42px', maxHeight: '100px' }}
          onClick={handleNoApiKeyClick}
          readOnly={!hasApiKey}
        />
        {!hasApiKey && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <Key className="h-4 w-4 text-amber-500" />
          </div>
        )}
      </div>
      <div className="flex items-end">
        <button
          type="button"
          onClick={onUploadFile}
          className={cn(
            "p-2 rounded-md transition-colors",
            disabled || isLoading || !hasApiKey ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"
          )}
          disabled={disabled || isLoading || !hasApiKey}
        >
          <Upload className="w-5 h-5" />
        </button>
        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading || disabled || !hasApiKey}
          className={cn(
            "p-2 rounded-md transition-colors text-white",
            inputValue.trim() && !isLoading && !disabled && hasApiKey
              ? "bg-blue-500 hover:bg-blue-600" 
              : "bg-gray-300 cursor-not-allowed"
          )}
        >
          <SendHorizontal className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
};

export default ChatInput;
