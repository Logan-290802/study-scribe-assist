
import React, { useState } from 'react';
import { SendHorizontal, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || disabled) return;
    
    onSendMessage(input);
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
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
        disabled={!input.trim() || isLoading || disabled}
        className={cn(
          "p-2 rounded-md transition-colors text-white",
          input.trim() && !isLoading && !disabled
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
