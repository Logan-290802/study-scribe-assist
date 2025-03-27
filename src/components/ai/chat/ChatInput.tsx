
import React, { useState } from 'react';
import { SendHorizontal, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onUploadFile: () => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  onUploadFile, 
  isLoading 
}) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    onSendMessage(input);
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask your AI research assistant..."
        className="flex-grow p-2 border rounded-md bg-white/80 focus:outline-none focus:ring-1 focus:ring-blue-500"
        disabled={isLoading}
      />
      <button
        type="button"
        onClick={onUploadFile}
        className="p-2 rounded-md transition-colors text-gray-600 hover:bg-gray-100"
      >
        <Upload className="w-5 h-5" />
      </button>
      <button
        type="submit"
        disabled={!input.trim() || isLoading}
        className={cn(
          "p-2 rounded-md transition-colors text-white",
          input.trim() && !isLoading 
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
