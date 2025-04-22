
import React from 'react';
import { CriticalSuggestion } from '@/services/ai/CriticalThinkingService';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { X, Check } from 'lucide-react';

interface SuggestionPopoverProps {
  suggestion: CriticalSuggestion | null;
  onApply: (suggestion: CriticalSuggestion) => void;
  onDismiss: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const typeLabels = {
  clarity: {
    label: 'Clarity Issue',
    color: 'bg-blue-100 text-blue-800'
  },
  logic: {
    label: 'Logical Issue',
    color: 'bg-purple-100 text-purple-800'
  },
  evidence: {
    label: 'Evidence Issue',
    color: 'bg-amber-100 text-amber-800'
  },
  structure: {
    label: 'Structure Issue',
    color: 'bg-green-100 text-green-800'
  }
};

export const SuggestionPopover: React.FC<SuggestionPopoverProps> = ({
  suggestion,
  onApply,
  onDismiss,
  open,
  onOpenChange
}) => {
  if (!suggestion) return null;
  
  const typeInfo = typeLabels[suggestion.type];
  
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger className="absolute opacity-0 w-0 h-0"></PopoverTrigger>
      <PopoverContent className="w-80 p-0 shadow-lg">
        <div className="px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${typeInfo.color}`}>
              {typeInfo.label}
            </span>
            <Button variant="ghost" size="sm" onClick={onDismiss} className="h-7 w-7 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <h4 className="text-sm font-medium mb-1">Original Text</h4>
            <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{suggestion.text}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Suggestion</h4>
            <p className="text-sm text-gray-700 bg-blue-50 p-2 rounded">{suggestion.suggestion}</p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={onDismiss}>
              Ignore
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => onApply(suggestion)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Check className="mr-1 h-4 w-4" />
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SuggestionPopover;
