
import React from 'react';
import { Editor } from '@tiptap/core';
import { 
  Bold, Italic, Underline, Strikethrough, Heading1, Heading2, 
  List, ListOrdered, Quote, Code, Link, Undo, Redo
} from 'lucide-react';
import { cn } from '@/lib/utils';
import CriticalThinkingToggle from './CriticalThinkingToggle';

interface EditorToolbarProps {
  editor: Editor | null;
  criticalThinkingEnabled?: boolean;
  criticalThinkingAnalyzing?: boolean;
  onToggleCriticalThinking?: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ 
  editor,
  criticalThinkingEnabled = false,
  criticalThinkingAnalyzing = false,
  onToggleCriticalThinking
}) => {
  if (!editor) {
    return null;
  }

  const ToolbarButton = ({ 
    onClick, 
    isActive = false, 
    disabled = false,
    children 
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    disabled?: boolean;
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "p-2 rounded-md transition-colors text-gray-600 hover:bg-gray-100 hover:text-gray-900",
        isActive && "bg-gray-100 text-blue-600",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50/80 backdrop-blur-sm">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
      >
        <Bold className="w-4 h-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
      >
        <Italic className="w-4 h-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
      >
        <Underline className="w-4 h-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
      >
        <Strikethrough className="w-4 h-4" />
      </ToolbarButton>
      
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive('heading', { level: 1 })}
      >
        <Heading1 className="w-4 h-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
      >
        <Heading2 className="w-4 h-4" />
      </ToolbarButton>
      
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
      >
        <List className="w-4 h-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
      >
        <ListOrdered className="w-4 h-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
      >
        <Quote className="w-4 h-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive('code')}
      >
        <Code className="w-4 h-4" />
      </ToolbarButton>
      
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      
      <ToolbarButton
        onClick={() => {
          const url = window.prompt('URL')
          if (url) {
            editor.chain().focus().setLink({ href: url }).run()
          }
        }}
        isActive={editor.isActive('link')}
      >
        <Link className="w-4 h-4" />
      </ToolbarButton>
      
      <div className="flex-grow"></div>
      
      {onToggleCriticalThinking && (
        <CriticalThinkingToggle
          enabled={criticalThinkingEnabled}
          analyzing={criticalThinkingAnalyzing}
          onToggle={onToggleCriticalThinking}
        />
      )}
      
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      
      <ToolbarButton
        onClick={() => editor.commands.undo()}
        disabled={!editor.can().undo()}
      >
        <Undo className="w-4 h-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.commands.redo()}
        disabled={!editor.can().redo()}
      >
        <Redo className="w-4 h-4" />
      </ToolbarButton>
    </div>
  );
};
