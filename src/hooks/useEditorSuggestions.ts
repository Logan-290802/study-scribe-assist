
import { useState, useEffect } from 'react';
import { Editor } from '@tiptap/core';
import { CriticalSuggestion } from '@/services/ai/CriticalThinkingService';

export const useEditorSuggestions = (
  editor: Editor | null,
  enabled: boolean,
  suggestions: CriticalSuggestion[],
  setSelectedSuggestion: (suggestion: CriticalSuggestion | null) => void
) => {
  const [suggestionPopoverOpen, setSuggestionPopoverOpen] = useState(false);

  useEffect(() => {
    if (!editor || !editor.view || !editor.view.dom) return;
    
    const handleEditorClick = () => {
      if (enabled) {
        const { from } = editor.state.selection;
        
        const matchingSuggestion = suggestions.find(
          suggestion => from >= suggestion.position.from && from <= suggestion.position.to
        );
        
        if (matchingSuggestion) {
          setSelectedSuggestion(matchingSuggestion);
          setSuggestionPopoverOpen(true);
        } else {
          setSuggestionPopoverOpen(false);
        }
      }
    };
    
    const editorDom = editor.view.dom;
    editorDom.addEventListener('click', handleEditorClick);
    
    return () => {
      editorDom.removeEventListener('click', handleEditorClick);
    };
  }, [editor, enabled, suggestions, setSelectedSuggestion]);

  useEffect(() => {
    if (editor && enabled) {
      editor.extensionStorage.suggestionHighlight = {
        suggestions,
        selectedSuggestionId: null,
      };
      editor.view.dispatch(editor.state.tr.setMeta('suggestion-update', true));
    }
  }, [editor, suggestions, enabled]);

  return {
    suggestionPopoverOpen,
    setSuggestionPopoverOpen
  };
};
