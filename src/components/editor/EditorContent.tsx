
import React from 'react';
import { EditorContent as TiptapContent, Editor } from '@tiptap/react';
import TextSelectionMenu from './TextSelectionMenu';
import SuggestionPopover from './SuggestionPopover';
import { CriticalSuggestion } from '@/services/ai/CriticalThinkingService';

interface EditorContentProps {
  editor: Editor | null;
  selectedSuggestion: CriticalSuggestion | null;
  onApplySuggestion: (suggestion: CriticalSuggestion) => void;
  suggestionPopoverOpen: boolean;
  onSuggestionPopoverOpenChange: (open: boolean) => void;
  onSelectionAction: (action: 'research' | 'critique' | 'expand', selectedText: string) => void;
}

export const EditorContent: React.FC<EditorContentProps> = ({
  editor,
  selectedSuggestion,
  onApplySuggestion,
  suggestionPopoverOpen,
  onSuggestionPopoverOpenChange,
  onSelectionAction,
}) => {
  if (!editor) return null;

  return (
    <div className="prose-lg max-w-none flex-grow">
      <TiptapContent editor={editor} className="min-h-[400px]" />
      <TextSelectionMenu onAction={onSelectionAction} />
      {selectedSuggestion && (
        <SuggestionPopover
          suggestion={selectedSuggestion}
          onApply={onApplySuggestion}
          onDismiss={() => {
            onSuggestionPopoverOpenChange(false);
          }}
          open={suggestionPopoverOpen}
          onOpenChange={onSuggestionPopoverOpenChange}
        />
      )}
    </div>
  );
};

export default EditorContent;
