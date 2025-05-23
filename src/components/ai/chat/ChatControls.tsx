
import React, { useRef } from 'react';
import ChatInput from './ChatInput';
import { ALLOWED_FILE_TYPES } from '@/hooks/ai-chat/fileUtils';

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

  // Create the accept string from our allowed MIME types
  const acceptedFileTypes = Object.keys(ALLOWED_FILE_TYPES).join(',');

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
        accept={acceptedFileTypes}
        className="hidden"
      />
    </div>
  );
};

export default ChatControls;
