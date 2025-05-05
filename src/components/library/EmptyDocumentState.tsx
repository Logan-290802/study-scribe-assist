
import React from 'react';
import { FileText, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface EmptyDocumentStateProps {
  isArchived: boolean;
  searchQuery: string;
}

const EmptyDocumentState: React.FC<EmptyDocumentStateProps> = ({ isArchived, searchQuery }) => {
  const navigate = useNavigate();

  return (
    <div className="text-center py-12 border rounded-md bg-gray-50">
      {isArchived ? (
        <Archive className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      ) : (
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      )}
      
      <h3 className="text-lg font-medium text-gray-900">
        {isArchived ? 'No archived documents' : 'No documents found'}
      </h3>
      
      <p className="mt-1 text-sm text-gray-500">
        {searchQuery 
          ? 'Try a different search term' 
          : isArchived 
            ? 'Documents you archive will appear here' 
            : 'Start by creating a new document'
        }
      </p>
      
      {!isArchived && (
        <Button className="mt-4" onClick={() => navigate('/dashboard')}>
          Create Document
        </Button>
      )}
    </div>
  );
};

export default EmptyDocumentState;
