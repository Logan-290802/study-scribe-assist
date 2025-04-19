
import React, { useRef, useEffect } from 'react';
import { SendHorizontal, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatInput } from '@/contexts/ChatInputContext';

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
  placeholder = "Ask Claude anything..."
}) => {
  const { inputValue, setInputValue } = useChatInput();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasApiKey = localStorage.getItem('CLAUDE_API_KEY') !== null;

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

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 100);
    textarea.style.height = `${newHeight}px`;
  }, [inputValue]);

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="flex-grow">
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={hasApiKey ? placeholder : "Please add your Claude API key to start chatting"}
          rows={1}
          className={cn(
            "w-full p-2 border rounded-md bg-white/80 focus:outline-none focus:ring-1 resize-none overflow-y-auto",
            "focus:ring-blue-500"
          )}
          disabled={isLoading || disabled || !hasApiKey}
          style={{ minHeight: '42px', maxHeight: '100px' }}
        />
      </div>
      
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
    </form>
  );
};

export default ChatInput;
