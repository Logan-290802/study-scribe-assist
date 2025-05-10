
import { useState, useEffect, useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { Editor } from '@tiptap/core';
import { aiServiceManager } from '@/services/ai/AiServiceManager';
import { CriticalSuggestion } from '@/services/ai/CriticalThinkingService';
import { useToast } from '@/components/ui/use-toast';

export const useCriticalThinking = (editor: Editor | null) => {
  const [enabled, setEnabled] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<CriticalSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<CriticalSuggestion | null>(null);
  const { toast } = useToast();

  // Clear suggestions when disabled
  useEffect(() => {
    if (!enabled) {
      setSuggestions([]);
      setSelectedSuggestion(null);
    }
  }, [enabled]);

  // Analyze text with debounce
  const analyzeText = useDebouncedCallback(async () => {
    if (!editor || !enabled) return;
    
    const content = editor.getText();
    if (content.length < 50) return; // Don't analyze very short content
    
    setAnalyzing(true);
    
    try {
      const newSuggestions = await aiServiceManager.analyzeCriticalThinking(content);
      setSuggestions(newSuggestions);
      
      if (newSuggestions.length > 0) {
        toast({
          title: "Critical Thinking Analysis Complete",
          description: `Found ${newSuggestions.length} suggestions for improvement.`,
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error analyzing text:', error);
    } finally {
      setAnalyzing(false);
    }
  }, 1500);

  // Trigger analysis when content changes and feature is enabled
  useEffect(() => {
    if (!editor || !enabled) return;
    
    const handleUpdate = () => {
      analyzeText();
    };
    
    editor.on('update', handleUpdate);
    
    // Initial analysis
    analyzeText();
    
    return () => {
      editor.off('update', handleUpdate);
    };
  }, [editor, enabled, analyzeText]);

  // Apply a suggestion to the editor
  const applySuggestion = useCallback((suggestion: CriticalSuggestion) => {
    if (!editor) return;
    
    const { from, to } = suggestion.position;
    
    editor
      .chain()
      .focus()
      .setTextSelection({ from, to })
      .deleteSelection()
      .insertContent(suggestion.suggestion)
      .run();
    
    // Remove the suggestion from the list
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    setSelectedSuggestion(null);
    
    toast({
      title: "Suggestion Applied",
      description: "The text has been updated with the suggestion.",
      duration: 2000,
    });
  }, [editor, toast]);

  // Toggle the feature on/off
  const toggleCriticalThinking = useCallback(() => {
    setEnabled(prev => {
      const newValue = !prev;
      if (newValue) {
        toast({
          title: "Critical Thinking Enabled",
          description: "Your text will be analyzed for potential improvements.",
          duration: 3000,
        });
        // Trigger initial analysis
        if (editor) {
          analyzeText();
        }
      }
      return newValue;
    });
  }, [editor, toast, analyzeText]);

  return {
    enabled,
    analyzing,
    suggestions,
    setSuggestions,
    selectedSuggestion,
    setSelectedSuggestion,
    toggleCriticalThinking,
    applySuggestion
  };
};

export default useCriticalThinking;
