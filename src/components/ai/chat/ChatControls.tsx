
import React, { useRef } from 'react';
import ChatInput from './ChatInput';

interface ChatControlsProps {
  onSendMessage: (message: string) => void;
  onFileUpload: (file: File) => void;
  isLoading: boolean;
  isDisabled: boolean;
}

const ChatControls: React.FC<ChatControlsProps> = ({
  onSendMessage,
  onFileUpload,
  isLoading,
  isDisabled
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-3 border-t">
      <ChatInput 
        onSendMessage={onSendMessage}
        onUploadFile={triggerFileUpload}
        isLoading={isLoading}
        disabled={isDisabled}
        placeholder={!isDisabled ? "Ask your AI research assistant..." : "Sign in to chat with AI assistant"}
      />
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="application/pdf"
        className="hidden"
      />
    </div>
  );
};

export default ChatControls;
