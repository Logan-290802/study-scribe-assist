
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DocumentTitle from '@/components/editor/DocumentTitle';

interface DocumentHeaderProps {
  documentTitle: string;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

const DocumentHeader: React.FC<DocumentHeaderProps> = ({
  documentTitle,
  onTitleChange,
  onSave,
  isSaving
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <DocumentTitle 
          title={documentTitle}
          onTitleChange={onTitleChange}
        />
      </div>
      <Button onClick={onSave} disabled={isSaving}>
        <Save className="h-4 w-4 mr-2" />
        {isSaving ? 'Saving...' : 'Save'}
      </Button>
    </div>
  );
};

export default DocumentHeader;
