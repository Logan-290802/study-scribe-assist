
import React from 'react';
import { Document } from '@/types/document.types';
import DocumentCard from './DocumentCard';
import EmptyDocumentState from './EmptyDocumentState';

interface DocumentGridProps {
  projects: Document[];
  isArchived: boolean;
  searchQuery: string;
  onOpenProject: (id: string) => void;
  onArchiveProject: (id: string, archive: boolean) => Promise<void>;
  onDeleteClick: (id: string) => void;
  formatDate: (date: Date) => string;
}

const DocumentGrid: React.FC<DocumentGridProps> = ({
  projects,
  isArchived,
  searchQuery,
  onOpenProject,
  onArchiveProject,
  onDeleteClick,
  formatDate
}) => {
  if (projects.length === 0) {
    return <EmptyDocumentState isArchived={isArchived} searchQuery={searchQuery} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <DocumentCard
          key={project.id}
          project={project}
          isArchived={isArchived}
          onOpen={onOpenProject}
          onArchive={onArchiveProject}
          onDelete={onDeleteClick}
          formatDate={formatDate}
        />
      ))}
    </div>
  );
};

export default DocumentGrid;
