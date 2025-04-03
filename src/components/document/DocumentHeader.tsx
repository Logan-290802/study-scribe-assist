
import React from 'react';
import { Button } from '@/components/ui/button';
import DocumentTitle from '@/components/editor/DocumentTitle';
import { Save, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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
  const handleSaveClick = () => {
    onSave();
  };

  return (
    <div className="flex items-center justify-between bg-white border-b p-4 rounded-t-md">
      <DocumentTitle
        title={documentTitle}
        onTitleChange={onTitleChange}
      />
      
      <div className="flex items-center gap-4">
        {lastSaved && (
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            <span>
              {isSaving ? 'Saving...' : `Saved ${formatDistanceToNow(lastSaved, { addSuffix: true })}`}
            </span>
          </div>
        )}
        
        <Button 
          onClick={handleSaveClick}
          disabled={isSaving}
          className="flex items-center gap-1"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
};

export default DocumentHeader;
