
import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Blockquote from '@tiptap/extension-blockquote';
import Code from '@tiptap/extension-code';
import CodeBlock from '@tiptap/extension-code-block';
import Link from '@tiptap/extension-link';
import History from '@tiptap/extension-history';
import { EditorToolbar } from './EditorToolbar';

interface TextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      Underline,
      Strike,
      Heading.configure({
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
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return <div className="animate-pulse-subtle p-4 h-[400px] bg-gray-100 rounded-md"></div>;
  }

  return (
    <div className="flex flex-col h-full border rounded-md overflow-hidden glass-card">
      <EditorToolbar editor={editor} />
      <div className="flex-grow overflow-auto thin-scrollbar">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
};

export default TextEditor;
