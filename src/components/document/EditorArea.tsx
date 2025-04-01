
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import TextEditor from '@/components/editor/TextEditor';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EditorAreaProps {
  content: string;
  onChange: (content: string) => void;
  onAiAction: (action: string, selection: string) => void;
}

const EditorArea: React.FC<EditorAreaProps> = ({
  content,
  onChange,
  onAiAction
}) => {
  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <ScrollArea className="h-[calc(100vh-250px)]">
          <TextEditor
            content={content}
            onChange={onChange}
            onAiAction={onAiAction}
          />
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default EditorArea;
