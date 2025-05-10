
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { MoreVertical, Edit, Trash2, Archive, Calendar, Link2, Clock, ArchiveRestore } from 'lucide-react';
import { Document } from '@/types/document.types';

interface DocumentCardProps {
  project: Document;
  isArchived: boolean;
  onOpen: (id: string) => void;
  onArchive: (id: string, archive: boolean) => Promise<void>;
  onDelete: (id: string) => void;
  formatDate: (date: Date) => string;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  project,
  isArchived,
  onOpen,
  onArchive,
  onDelete,
  formatDate
}) => {
  return (
    <HoverCard key={project.id} openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <Card 
          className={`cursor-pointer hover:shadow-md transition-shadow ${isArchived ? 'opacity-75' : ''}`}
          onClick={() => onOpen(project.id)}
        >
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <h3 className="font-medium text-lg line-clamp-1 mb-2">{project.title}</h3>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48" align="end">
                  <div className="flex flex-col space-y-1">
                    {!isArchived && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="justify-start" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpen(project.id);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    )}
                    {!isArchived ? (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="justify-start text-amber-600" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onArchive(project.id, true);
                        }}
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        Archive
                      </Button>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="justify-start text-blue-600" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onArchive(project.id, false);
                        }}
                      >
                        <ArchiveRestore className="mr-2 h-4 w-4" />
                        Restore
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="justify-start text-red-600" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(project.id);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {isArchived ? 'Delete Permanently' : 'Delete'}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            <p 
              className="text-gray-600 text-sm line-clamp-2 mb-4"
              dangerouslySetInnerHTML={{ __html: project.snippet }}
            />
            
            <div className="flex justify-between text-xs text-gray-500">
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(project.lastModified)}
              </div>
              <div className="flex items-center">
                <Link2 className="h-3 w-3 mr-1" />
                {project.referencesCount} references
              </div>
            </div>
          </CardContent>
        </Card>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-4">
        <h4 className="font-semibold">{project.title}</h4>
        <p 
          className="text-sm text-gray-600 mt-2"
          dangerouslySetInnerHTML={{ __html: project.snippet }}
        />
        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500 space-y-1">
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-2" />
            Last modified: {formatDate(project.lastModified)}
          </div>
          <div className="flex items-center">
            <Link2 className="h-3 w-3 mr-2" />
            {project.referencesCount} references
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default DocumentCard;
