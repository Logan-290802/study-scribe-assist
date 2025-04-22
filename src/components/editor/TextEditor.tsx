
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
import { SuggestionHighlight } from './extensions/SuggestionHighlight';
import TextSelectionMenu from './TextSelectionMenu';
import { useChatInput } from '@/contexts/ChatInputContext';
import useCriticalThinking from '@/hooks/useCriticalThinking';
import SuggestionPopover from './SuggestionPopover';
import SuggestionsList from './SuggestionsList';
import './critical-thinking.css';

interface TextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onAiAction?: (action: 'research' | 'critique' | 'expand', selectedText: string) => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({ content, onChange, onAiAction }) => {
  const [headings, setHeadings] = useState<{ id: string; level: number; text: string }[]>([]);
  const { setInputValue } = useChatInput();
  const [suggestionPopoverOpen, setSuggestionPopoverOpen] = useState(false);
  
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
    },
    onSelectionUpdate: ({ editor }) => {
      // When selection changes, check if it's on a suggestion
      if (criticalThinking.enabled) {
        const { suggestions } = criticalThinking;
        const { from } = editor.state.selection;
        
        const matchingSuggestion = suggestions.find(
          suggestion => from >= suggestion.position.from && from <= suggestion.position.to
        );
        
        if (matchingSuggestion) {
          criticalThinking.setSelectedSuggestion(matchingSuggestion);
          setSuggestionPopoverOpen(true);
        }
      }
    },
    onClick: ({ editor }) => {
      // Similar to selection update but for clicks
      if (criticalThinking.enabled) {
        const { suggestions } = criticalThinking;
        const { from } = editor.state.selection;
        
        const matchingSuggestion = suggestions.find(
          suggestion => from >= suggestion.position.from && from <= suggestion.position.to
        );
        
        if (matchingSuggestion) {
          criticalThinking.setSelectedSuggestion(matchingSuggestion);
          setSuggestionPopoverOpen(true);
        } else {
          // Close popover when clicking elsewhere
          setSuggestionPopoverOpen(false);
        }
      }
    }
  });

  const criticalThinking = useCriticalThinking(editor);

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

  // Update the SuggestionHighlight extension when suggestions change
  useEffect(() => {
    if (editor && criticalThinking.enabled) {
      editor.extensionStorage.suggestionHighlight = {
        suggestions: criticalThinking.suggestions,
        selectedSuggestionId: criticalThinking.selectedSuggestion?.id || null,
      };
      editor.view.dispatch(editor.state.tr.setMeta('suggestion-update', true));
    }
  }, [editor, criticalThinking.suggestions, criticalThinking.selectedSuggestion, criticalThinking.enabled]);

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

  // Handle dismissing a suggestion
  const handleDismissSuggestion = (suggestionId: string) => {
    criticalThinking.setSuggestions(prev => 
      prev.filter(s => s.id !== suggestionId)
    );
    
    if (criticalThinking.selectedSuggestion?.id === suggestionId) {
      criticalThinking.setSelectedSuggestion(null);
      setSuggestionPopoverOpen(false);
    }
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
        <div className="prose-lg max-w-none flex-grow">
          <EditorContent editor={editor} className="min-h-[400px]" />
          <TextSelectionMenu onAction={handleSelectionAction} />
          {criticalThinking.selectedSuggestion && (
            <SuggestionPopover
              suggestion={criticalThinking.selectedSuggestion}
              onApply={criticalThinking.applySuggestion}
              onDismiss={() => {
                setSuggestionPopoverOpen(false);
                criticalThinking.setSelectedSuggestion(null);
              }}
              open={suggestionPopoverOpen}
              onOpenChange={setSuggestionPopoverOpen}
            />
          )}
        </div>
        
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
                
                // Move cursor to the suggestion
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
