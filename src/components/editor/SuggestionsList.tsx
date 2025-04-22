
import React from 'react';
import { CriticalSuggestion } from '@/services/ai/CriticalThinkingService';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuggestionsListProps {
  suggestions: CriticalSuggestion[];
  selectedSuggestionId: string | null;
  onSelectSuggestion: (suggestion: CriticalSuggestion) => void;
  onApplySuggestion: (suggestion: CriticalSuggestion) => void;
  onDismissSuggestion: (suggestionId: string) => void;
}

const typeIcons = {
  clarity: { color: "text-blue-500", label: "Clarity" },
  logic: { color: "text-purple-500", label: "Logic" },
  evidence: { color: "text-amber-500", label: "Evidence" },
  structure: { color: "text-green-500", label: "Structure" },
};

export const SuggestionsList: React.FC<SuggestionsListProps> = ({
  suggestions,
  selectedSuggestionId,
  onSelectSuggestion,
  onApplySuggestion,
  onDismissSuggestion
}) => {
  if (!suggestions.length) {
    return (
      <div className="py-8 text-center text-gray-400">
        <Brain className="mx-auto h-8 w-8 opacity-40 mb-2" />
        <p className="text-sm">No suggestions available.</p>
        <p className="text-xs mt-1">Keep writing and I'll analyze your text.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-350px)]">
      <div className="space-y-2 p-2">
        {suggestions.map(suggestion => {
          const typeInfo = typeIcons[suggestion.type];
          const isSelected = selectedSuggestionId === suggestion.id;
          
          return (
            <div 
              key={suggestion.id}
              className={cn(
                "border rounded-md p-2 cursor-pointer transition-colors",
                isSelected ? "border-purple-300 bg-purple-50" : "border-gray-200 hover:border-gray-300"
              )}
              onClick={() => onSelectSuggestion(suggestion)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={cn("text-xs font-medium", typeInfo.color)}>
                  {typeInfo.label}
                </span>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onApplySuggestion(suggestion);
                    }}
                    className="p-1 hover:bg-green-100 rounded-sm"
                    title="Apply suggestion"
                  >
                    <Check className="h-3 w-3 text-green-600" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDismissSuggestion(suggestion.id);
                    }}
                    className="p-1 hover:bg-red-100 rounded-sm"
                    title="Dismiss suggestion"
                  >
                    <X className="h-3 w-3 text-red-600" />
                  </button>
                </div>
              </div>
              
              <div className="text-xs line-clamp-2 text-gray-700">
                <span className="font-medium">Original: </span>
                {suggestion.text.substring(0, 50)}{suggestion.text.length > 50 ? '...' : ''}
              </div>
              
              <div className="text-xs mt-1 line-clamp-2 text-blue-700">
                <span className="font-medium">Suggestion: </span>
                {suggestion.suggestion.substring(0, 50)}{suggestion.suggestion.length > 50 ? '...' : ''}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default SuggestionsList;
