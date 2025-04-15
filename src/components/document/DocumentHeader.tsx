
import React from 'react';
import { Button } from '@/components/ui/button';
import DocumentTitle from '@/components/editor/DocumentTitle';
import { Save } from 'lucide-react';
import { SaveIndicator } from './SaveIndicator';

interface DocumentHeaderProps {
  documentTitle: string;
  onTitleChange: (title: string) => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
  lastSaved?: Date | null;
}

const DocumentHeader: React.FC<DocumentHeaderProps> = ({
  documentTitle,
  onTitleChange,
  onSave,
  isSaving,
  lastSaved
}) => {
  return (
    <div className="flex items-center justify-between bg-white border-b p-4 rounded-t-md">
      <DocumentTitle
        title={documentTitle}
        onTitleChange={onTitleChange}
      />
      
      <div className="flex items-center gap-4">
        <SaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
        
        <Button 
          onClick={onSave}
          disabled={isSaving}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Save
        </Button>
      </div>
    </div>
  );
};

export default DocumentHeader;
