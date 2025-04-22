
import React from 'react';
import { Brain } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface CriticalThinkingToggleProps {
  enabled: boolean;
  analyzing: boolean;
  onToggle: () => void;
}

export const CriticalThinkingToggle: React.FC<CriticalThinkingToggleProps> = ({ 
  enabled, 
  analyzing,
  onToggle 
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-100">
            <Brain className={cn(
              "w-4 h-4 transition-colors",
              enabled ? "text-purple-600" : "text-gray-500"
            )} />
            <Switch
              checked={enabled}
              onCheckedChange={onToggle}
              className={cn(
                analyzing && "animate-pulse"
              )}
            />
            <span className="text-xs font-medium">Critical Thinker</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Enable AI-powered critical thinking analysis</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CriticalThinkingToggle;
