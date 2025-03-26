
import React from 'react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { List, Heading1, Heading2, Heading3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Heading {
  id: string;
  level: number;
  text: string;
}

interface HeadingNavigatorProps {
  headings: Heading[];
  onHeadingClick: (id: string) => void;
}

export const HeadingNavigator: React.FC<HeadingNavigatorProps> = ({ 
  headings, 
  onHeadingClick 
}) => {
  const getHeadingIcon = (level: number) => {
    switch (level) {
      case 1:
        return <Heading1 className="h-4 w-4" />;
      case 2:
        return <Heading2 className="h-4 w-4" />;
      case 3:
        return <Heading3 className="h-4 w-4" />;
      default:
        return <Heading1 className="h-4 w-4" />;
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 mr-2 gap-1">
          <List className="h-4 w-4" />
          <span className="hidden sm:inline">Headings</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <div className="p-2">
          <h3 className="font-medium text-sm mb-2">Document Outline</h3>
          <div className="max-h-64 overflow-y-auto">
            {headings.length === 0 ? (
              <p className="text-sm text-muted-foreground px-2 py-1">No headings found</p>
            ) : (
              <div className="space-y-1">
                {headings.map((heading) => (
                  <button
                    key={heading.id}
                    className={`flex items-center w-full text-left px-2 py-1 text-sm rounded hover:bg-accent ${
                      heading.level === 1 ? "font-semibold" : ""
                    }`}
                    style={{ paddingLeft: `${heading.level * 0.5}rem` }}
                    onClick={() => onHeadingClick(heading.id)}
                  >
                    <span className="mr-2">{getHeadingIcon(heading.level)}</span>
                    <span className="truncate">{heading.text || "Untitled Heading"}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
