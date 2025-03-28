
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import TextEditor from '@/components/editor/TextEditor';

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
      <CardContent className="p-4 min-h-[500px]">
        <TextEditor
          content={content}
          onChange={onChange}
          onAiAction={onAiAction}
        />
      </CardContent>
    </Card>
  );
};

export default EditorArea;
