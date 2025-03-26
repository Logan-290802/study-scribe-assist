
import React, { useState, useRef, useEffect } from 'react';
import { Edit2 } from 'lucide-react';

interface DocumentTitleProps {
  title: string;
  onTitleChange: (title: string) => void;
}

export const DocumentTitle: React.FC<DocumentTitleProps> = ({ title, onTitleChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onTitleChange(inputValue);
    } else {
      setInputValue(title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      setInputValue(title);
      setIsEditing(false);
    }
  };

  return (
    <div className="mb-4 animate-fade-in">
      {isEditing ? (
        <div className="flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleSubmit}
            onKeyDown={handleKeyDown}
            className="text-2xl font-semibold w-full border-b-2 border-blue-400 outline-none bg-transparent py-1"
            placeholder="Document Title"
          />
        </div>
      ) : (
        <div 
          className="flex items-center group"
          onClick={() => setIsEditing(true)}
        >
          <h1 className="text-2xl font-semibold mr-2 cursor-text transition-colors hover:text-blue-700">
            {title || "Untitled Document"}
          </h1>
          <button className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Edit2 className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentTitle;
