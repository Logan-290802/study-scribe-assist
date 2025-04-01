
import React from 'react';
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
  placeholder = "Ask your AI research assistant..."
}) => {
  const { inputValue, setInputValue } = useChatInput();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || disabled) return;
    
    onSendMessage(inputValue);
    setInputValue('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
        className="flex-grow p-2 border rounded-md bg-white/80 focus:outline-none focus:ring-1 focus:ring-blue-500"
        disabled={isLoading || disabled}
      />
      <button
        type="button"
        onClick={onUploadFile}
        className={cn(
          "p-2 rounded-md transition-colors",
          disabled || isLoading ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"
        )}
        disabled={disabled || isLoading}
      >
        <Upload className="w-5 h-5" />
      </button>
      <button
        type="submit"
        disabled={!inputValue.trim() || isLoading || disabled}
        className={cn(
          "p-2 rounded-md transition-colors text-white",
          inputValue.trim() && !isLoading && !disabled
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
