
import React from 'react';
import { Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SaveIndicatorProps {
  isSaving: boolean;
  lastSaved: Date | null;
}

export const SaveIndicator = ({ isSaving, lastSaved }: SaveIndicatorProps) => {
  const [showCheck, setShowCheck] = React.useState(false);
  
  React.useEffect(() => {
    if (!isSaving && lastSaved) {
      setShowCheck(true);
      const timer = setTimeout(() => setShowCheck(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSaving, lastSaved]);

  if (!lastSaved && !isSaving) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground transition-opacity duration-300">
      {isSaving ? (
        <div className="flex items-center gap-2 animate-fade-in">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Saving...</span>
        </div>
      ) : showCheck ? (
        <div className={cn(
          "flex items-center gap-2",
          "animate-fade-in"
        )}>
          <Check className="h-3 w-3 text-green-500" />
          <span>Saved</span>
        </div>
      ) : null}
    </div>
  );
};
