
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { CriticalSuggestion } from '@/services/ai/CriticalThinkingService';

export interface SuggestionHighlightOptions {
  suggestions: CriticalSuggestion[];
  selectedSuggestionId: string | null;
}

export const SuggestionHighlight = Extension.create<SuggestionHighlightOptions>({
  name: 'suggestionHighlight',

  addOptions() {
    return {
      suggestions: [],
      selectedSuggestionId: null,
    };
  },

  addProseMirrorPlugins() {
    const { suggestions, selectedSuggestionId } = this.options;

    return [
      new Plugin({
        key: new PluginKey('suggestionHighlight'),
        props: {
          decorations(state) {
            if (!suggestions.length) return DecorationSet.empty;

            const decorations: Decoration[] = [];

            suggestions.forEach(suggestion => {
              const { from, to } = suggestion.position;
              const isSelected = selectedSuggestionId === suggestion.id;
              
              let className = 'suggestion-highlight';
              
              switch (suggestion.type) {
                case 'clarity':
                  className += ' suggestion-clarity';
                  break;
                case 'logic':
                  className += ' suggestion-logic';
                  break;
                case 'evidence':
                  className += ' suggestion-evidence';
                  break;
                case 'structure':
                  className += ' suggestion-structure';
                  break;
              }
              
              if (isSelected) {
                className += ' suggestion-selected';
              }

              decorations.push(
                Decoration.inline(from, to, {
                  class: className,
                  'data-suggestion-id': suggestion.id,
                })
              );
            });

            return DecorationSet.create(state.doc, decorations);
          }
        }
      })
    ];
  },
});
