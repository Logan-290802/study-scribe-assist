
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Archive } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDocuments } from '@/store/DocumentStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DocumentGrid from './DocumentGrid';
import DeleteDocumentDialog from './DeleteDocumentDialog';

interface MyWorkListProps {
  searchQuery: string;
}

const MyWorkList: React.FC<MyWorkListProps> = ({ searchQuery }) => {
  const [sortBy, setSortBy] = useState<string>('date');
  const [docToDelete, setDocToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const navigate = useNavigate();
  const { documents, deleteDocument, archiveDocument } = useDocuments();
  
  // Filter projects based on search query and archive status
  const filteredProjects = documents.filter(project => 
    (project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.snippet.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (activeTab === 'active' ? !project.archived : project.archived)
  );
  
  // Sort projects based on selected sort option
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'references':
        return b.referencesCount - a.referencesCount;
      case 'date':
      default:
        return b.lastModified.getTime() - a.lastModified.getTime();
    }
  });
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric'
    });
  };
  
  const handleOpenProject = (id: string) => {
    // Navigate to the document editor page with the project id
    navigate(`/documents/${id}`);
  };
  
  const handleDeleteProject = async (id: string) => {
    await deleteDocument(id);
    setDocToDelete(null);
  };
  
  const handleArchiveProject = async (id: string, archive: boolean) => {
    await archiveDocument(id, archive);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">My Documents</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Sort by:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Last Modified</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="references">References Count</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'active' | 'archived')}>
        <TabsList className="mb-4">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Active Documents</span>
          </TabsTrigger>
          <TabsTrigger value="archived" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            <span>Archived</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-0">
          <DocumentGrid
            projects={sortedProjects}
            isArchived={false}
            searchQuery={searchQuery}
            onOpenProject={handleOpenProject}
            onArchiveProject={handleArchiveProject}
            onDeleteClick={setDocToDelete}
            formatDate={formatDate}
          />
        </TabsContent>
        
        <TabsContent value="archived" className="mt-0">
          <DocumentGrid
            projects={sortedProjects}
            isArchived={true}
            searchQuery={searchQuery}
            onOpenProject={handleOpenProject}
            onArchiveProject={handleArchiveProject}
            onDeleteClick={setDocToDelete}
            formatDate={formatDate}
          />
        </TabsContent>
      </Tabs>
      
      <DeleteDocumentDialog
        isOpen={!!docToDelete}
        docId={docToDelete}
        onClose={() => setDocToDelete(null)}
        onDelete={handleDeleteProject}
      />
    </div>
  );
};

export default MyWorkList;
