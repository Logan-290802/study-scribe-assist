
import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Blockquote from '@tiptap/extension-blockquote';
import Code from '@tiptap/extension-code';
import CodeBlock from '@tiptap/extension-code-block';
import Link from '@tiptap/extension-link';
import History from '@tiptap/extension-history';
import { EditorToolbar } from './EditorToolbar';
import { HeadingNavigator } from './HeadingNavigator';
import { HeadingWithId } from './extensions/HeadingWithId';
import TextSelectionMenu from './TextSelectionMenu';
import { useChatInput } from '@/contexts/ChatInputContext';

interface TextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onAiAction?: (action: 'research' | 'critique' | 'expand', selectedText: string) => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({ content, onChange, onAiAction }) => {
  const [headings, setHeadings] = useState<{ id: string; level: number; text: string }[]>([]);
  const { setInputValue } = useChatInput();
  
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      Underline,
      Strike,
      HeadingWithId.configure({
        levels: [1, 2, 3],
      }),
      BulletList,
      OrderedList,
      ListItem,
      Blockquote,
      Code,
      CodeBlock,
      Link.configure({
        openOnClick: true,
      }),
      History,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
      updateHeadings(editor);
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  useEffect(() => {
    if (editor) {
      updateHeadings(editor);
    }
  }, [editor]);

  const updateHeadings = (editor: any) => {
    if (!editor) return;
    
    const headingNodes: { id: string; level: number; text: string }[] = [];
    editor.state.doc.descendants((node: any, pos: number) => {
      if (node.type.name === 'heading') {
        // Generate an ID for each heading for navigation
        const id = `heading-${pos}`;
        headingNodes.push({
          id,
          level: node.attrs.level,
          text: node.textContent
        });
        
        // Update the heading element in the DOM to include the ID
        const domNode = document.querySelector(`.ProseMirror .node-${node.type.name}-${pos}`);
        if (domNode) {
          domNode.id = id;
        }
      }
    });
    
    setHeadings(headingNodes);
  };

  const scrollToHeading = (id: string) => {
    // Find the heading in the editor content
    const element = document.getElementById(id);
    if (element) {
      // Scroll to the heading
      element.scrollIntoView({ behavior: 'smooth' });
      
      // Optionally, focus the editor at that position
      if (editor) {
        editor.commands.focus();
      }
    }
  };

  const handleSelectionAction = (action: 'research' | 'critique' | 'expand', selectedText: string) => {
    if (onAiAction) {
      // Instead of directly calling onAiAction, populate the chat input
      const actionPrompts = {
        'research': `Research this: "${selectedText}"`,
        'critique': `Critique this: "${selectedText}"`,
        'expand': `Expand on this: "${selectedText}"`
      };
      
      // Set the input value in the chat input
      setInputValue(actionPrompts[action]);
    }
  };

  if (!editor) {
    return <div className="animate-pulse-subtle p-4 h-[400px] bg-gray-100 rounded-md"></div>;
  }

  return (
    <div className="flex flex-col h-full border rounded-md overflow-hidden glass-card">
      <div className="flex items-center border-b">
        <EditorToolbar editor={editor} />
        <HeadingNavigator headings={headings} onHeadingClick={scrollToHeading} />
      </div>
      <div className="flex-grow overflow-auto thin-scrollbar">
        <EditorContent editor={editor} className="h-full" />
        <TextSelectionMenu onAction={handleSelectionAction} />
      </div>
    </div>
  );
};

export default TextEditor;
