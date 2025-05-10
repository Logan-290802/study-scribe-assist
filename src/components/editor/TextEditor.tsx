import React, { useEffect } from 'react';
import { useEditor } from '@tiptap/react';
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
import { SuggestionHighlight } from './extensions/SuggestionHighlight';
import { useChatInput } from '@/contexts/ChatInputContext';
import useCriticalThinking from '@/hooks/useCriticalThinking';
import EditorContent from './EditorContent';
import { useEditorHeadings } from '@/hooks/useEditorHeadings';
import { useEditorSuggestions } from '@/hooks/useEditorSuggestions';
import SuggestionsList from './SuggestionsList';
import './critical-thinking.css';

interface TextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onAiAction?: (action: 'research' | 'critique' | 'expand', selectedText: string) => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({ content, onChange, onAiAction }) => {
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
      SuggestionHighlight.configure({
        suggestions: [],
        selectedSuggestionId: null,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
      updateHeadings(editor);
    }
  });

  const criticalThinking = useCriticalThinking(editor);
  const { headings, updateHeadings, scrollToHeading } = useEditorHeadings(editor);
  const { suggestionPopoverOpen, setSuggestionPopoverOpen } = useEditorSuggestions(
    editor,
    criticalThinking.enabled,
    criticalThinking.suggestions,
    criticalThinking.setSelectedSuggestion
  );

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  useEffect(() => {
    if (editor) {
      updateHeadings(editor);
    }
  }, [editor, updateHeadings]);

  const handleSelectionAction = (action: 'research' | 'critique' | 'expand', selectedText: string) => {
    const actionPrompts = {
      'research': `Research this: "${selectedText}"`,
      'critique': `Critique this: "${selectedText}"`,
      'expand': `Expand on this: "${selectedText}"`
    };
    setInputValue(actionPrompts[action]);
    if (onAiAction) onAiAction(action, selectedText);
  };

  const handleDismissSuggestion = (suggestionId: string) => {
    const updatedSuggestions = criticalThinking.suggestions.filter(s => s.id !== suggestionId);
    
    if (criticalThinking.selectedSuggestion?.id === suggestionId) {
      criticalThinking.setSelectedSuggestion(null);
      setSuggestionPopoverOpen(false);
    }
    
    return updatedSuggestions;
  };

  if (!editor) {
    return <div className="animate-pulse-subtle p-4 h-[400px] bg-gray-100 rounded-md"></div>;
  }

  return (
    <div className="flex flex-col border rounded-md overflow-hidden glass-card">
      <div className="flex items-center border-b">
        <EditorToolbar 
          editor={editor} 
          criticalThinkingEnabled={criticalThinking.enabled}
          criticalThinkingAnalyzing={criticalThinking.analyzing}
          onToggleCriticalThinking={criticalThinking.toggleCriticalThinking}
        />
        <HeadingNavigator headings={headings} onHeadingClick={scrollToHeading} />
      </div>
      <div className="flex">
        <EditorContent
          editor={editor}
          selectedSuggestion={criticalThinking.selectedSuggestion}
          onApplySuggestion={criticalThinking.applySuggestion}
          suggestionPopoverOpen={suggestionPopoverOpen}
          onSuggestionPopoverOpenChange={setSuggestionPopoverOpen}
          onSelectionAction={handleSelectionAction}
        />
        {criticalThinking.enabled && (
          <div className="w-64 border-l bg-gray-50/80 flex flex-col">
            <div className="p-3 border-b">
              <h3 className="text-sm font-medium flex items-center justify-between">
                Suggestions
                {criticalThinking.analyzing && (
                  <span className="text-xs text-gray-500 animate-pulse">Analyzing...</span>
                )}
              </h3>
            </div>
            <SuggestionsList
              suggestions={criticalThinking.suggestions}
              selectedSuggestionId={criticalThinking.selectedSuggestion?.id || null}
              onSelectSuggestion={(suggestion) => {
                criticalThinking.setSelectedSuggestion(suggestion);
                setSuggestionPopoverOpen(true);
                
                if (editor) {
                  const { from, to } = suggestion.position;
                  editor.commands.setTextSelection({ from, to });
                  editor.commands.scrollIntoView();
                }
              }}
              onApplySuggestion={criticalThinking.applySuggestion}
              onDismissSuggestion={handleDismissSuggestion}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TextEditor;
