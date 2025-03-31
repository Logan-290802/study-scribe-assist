
import React, { useState, useEffect, useRef } from 'react';
import { Search, ThumbsDown, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TextSelectionMenuProps {
  onAction: (action: 'research' | 'critique' | 'expand', selectedText: string) => void;
}

const TextSelectionMenu: React.FC<TextSelectionMenuProps> = ({ onAction }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      
      if (selection && !selection.isCollapsed && selection.toString().trim() !== '') {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        // Only show the menu if selection is within the editor
        const editorElement = document.querySelector('.ProseMirror');
        if (editorElement && editorElement.contains(range.commonAncestorContainer)) {
          setSelectedText(selection.toString().trim());
          setPosition({
            top: rect.bottom + window.scrollY + 10, // 10px below the selection
            left: rect.left + window.scrollX + (rect.width / 2), // Centered
          });
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      } else {
        setIsVisible(false);
      }
    };

    // Add event listeners
    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mouseup', handleSelectionChange);
    
    // Cleanup
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mouseup', handleSelectionChange);
    };
  }, []);

  // Close the menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleActionClick = (action: 'research' | 'critique' | 'expand') => {
    setProcessingAction(action);
    onAction(action, selectedText);
    
    // Hide the menu after a short delay
    setTimeout(() => {
      setIsVisible(false);
      setProcessingAction(null);
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div 
      ref={menuRef}
      className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-1 transform -translate-x-1/2 animate-fade-in-up"
      style={{ 
        top: `${position.top}px`, 
        left: `${position.left}px`,
      }}
    >
      <div className="flex">
        <button 
          onClick={() => handleActionClick('research')}
          disabled={processingAction !== null}
          className={cn(
            "flex flex-col items-center justify-center p-2 rounded-md hover:bg-blue-50 transition-colors",
            processingAction === 'research' ? "bg-blue-50" : "",
            processingAction !== null && processingAction !== 'research' ? "opacity-50 cursor-not-allowed" : ""
          )}
        >
          {processingAction === 'research' ? (
            <Loader2 className="h-4 w-4 text-blue-600 mb-1 animate-spin" />
          ) : (
            <Search className="h-4 w-4 text-blue-600 mb-1" />
          )}
          <span className="text-xs">Research</span>
        </button>
        
        <button 
          onClick={() => handleActionClick('critique')}
          disabled={processingAction !== null}
          className={cn(
            "flex flex-col items-center justify-center p-2 rounded-md hover:bg-amber-50 transition-colors",
            processingAction === 'critique' ? "bg-amber-50" : "",
            processingAction !== null && processingAction !== 'critique' ? "opacity-50 cursor-not-allowed" : ""
          )}
        >
          {processingAction === 'critique' ? (
            <Loader2 className="h-4 w-4 text-amber-600 mb-1 animate-spin" />
          ) : (
            <ThumbsDown className="h-4 w-4 text-amber-600 mb-1" />
          )}
          <span className="text-xs">Critique</span>
        </button>
        
        <button 
          onClick={() => handleActionClick('expand')}
          disabled={processingAction !== null}
          className={cn(
            "flex flex-col items-center justify-center p-2 rounded-md hover:bg-green-50 transition-colors",
            processingAction === 'expand' ? "bg-green-50" : "",
            processingAction !== null && processingAction !== 'expand' ? "opacity-50 cursor-not-allowed" : ""
          )}
        >
          {processingAction === 'expand' ? (
            <Loader2 className="h-4 w-4 text-green-600 mb-1 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 text-green-600 mb-1" />
          )}
          <span className="text-xs">Expand</span>
        </button>
      </div>
    </div>
  );
};

export default TextSelectionMenu;
