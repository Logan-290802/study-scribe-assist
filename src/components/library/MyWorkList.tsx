import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FileText, MoreVertical, Edit, Trash2, Archive, Clock, Link2, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Project {
  id: string;
  title: string;
  snippet: string;
  lastModified: Date;
  referencesCount: number;
}

// Mock data for demo (reduced from 4 to 1 project)
const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Renewable Energy in Developing Countries',
    snippet: 'This paper explores the potential of renewable energy sources in developing countries, with a focus on solar and wind power implementations in rural areas.',
    lastModified: new Date('2023-05-15'),
    referencesCount: 12,
  }
];

interface MyWorkListProps {
  searchQuery: string;
}

const MyWorkList: React.FC<MyWorkListProps> = ({ searchQuery }) => {
  const [sortBy, setSortBy] = useState<string>('date');
  const navigate = useNavigate();
  
  // Filter projects based on search query
  const filteredProjects = MOCK_PROJECTS.filter(project => 
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.snippet.toLowerCase().includes(searchQuery.toLowerCase())
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
    // In a real app, this would navigate to the editor with the selected project
    navigate('/');
  };
  
  const handleDeleteProject = (id: string) => {
    // In a real app, this would delete the project
    console.log(`Delete project ${id}`);
  };
  
  const handleArchiveProject = (id: string) => {
    // In a real app, this would archive the project
    console.log(`Archive project ${id}`);
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
      
      {sortedProjects.length === 0 ? (
        <div className="text-center py-12 border rounded-md bg-gray-50">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No documents found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery ? 'Try a different search term' : 'Start by creating a new document'}
          </p>
          <Button className="mt-4" onClick={() => navigate('/')}>
            Create Document
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedProjects.map((project) => (
            <HoverCard key={project.id} openDelay={200} closeDelay={100}>
              <HoverCardTrigger asChild>
                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleOpenProject(project.id)}
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
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="justify-start" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenProject(project.id);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="justify-start text-amber-600" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleArchiveProject(project.id);
                              }}
                            >
                              <Archive className="mr-2 h-4 w-4" />
                              Archive
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="justify-start text-red-600" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProject(project.id);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {project.snippet}
                    </p>
                    
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
                <p className="text-sm text-gray-600 mt-2">{project.snippet}</p>
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
          ))}
        </div>
      )}
    </div>
  );
};

export default MyWorkList;
