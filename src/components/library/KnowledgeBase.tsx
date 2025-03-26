
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Book, 
  MoreVertical, 
  File, 
  Trash2, 
  Star, 
  ExternalLink, 
  Tag as TagIcon, 
  Plus,
  FileText,
  Download
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ReferenceSource {
  id: string;
  title: string;
  authors: string[];
  year: string;
  type: 'journal' | 'book' | 'website' | 'conference' | 'other';
  summary: string;
  tags: string[];
  hasPdf: boolean;
  discipline: string;
  usageCount: number;
  dateAdded: Date;
  isFavorite: boolean;
}

// Mock data for demo
const MOCK_SOURCES: ReferenceSource[] = [
  {
    id: '1',
    title: 'Climate Change Impacts on Global Food Security',
    authors: ['Wheeler, T.', 'von Braun, J.'],
    year: '2013',
    type: 'journal',
    summary: 'This paper examines the impacts of climate change on food security globally, analyzing potential disruptions to food systems and proposing adaptation strategies.',
    tags: ['climate change', 'food security', 'agriculture', 'sustainability'],
    hasPdf: true,
    discipline: 'Environmental Science',
    usageCount: 5,
    dateAdded: new Date('2023-03-15'),
    isFavorite: true,
  },
  {
    id: '2',
    title: 'The Psychology of Social Media Addiction',
    authors: ['Miller, A.', 'Thompson, K.', 'Garcia, L.'],
    year: '2022',
    type: 'journal',
    summary: 'An analysis of psychological factors contributing to social media addiction, examining dopamine responses, behavioral patterns, and potential intervention strategies.',
    tags: ['psychology', 'social media', 'addiction', 'mental health'],
    hasPdf: true,
    discipline: 'Psychology',
    usageCount: 3,
    dateAdded: new Date('2023-05-22'),
    isFavorite: false,
  },
  {
    id: '3',
    title: 'Ethical Frameworks for Artificial Intelligence Development',
    authors: ['Roberts, S.', 'Chang, H.'],
    year: '2021',
    type: 'book',
    summary: 'This book provides comprehensive ethical frameworks for AI development, addressing issues of bias, privacy, transparency, and accountability in machine learning systems.',
    tags: ['ethics', 'artificial intelligence', 'technology', 'philosophy'],
    hasPdf: false,
    discipline: 'Computer Science',
    usageCount: 7,
    dateAdded: new Date('2023-02-10'),
    isFavorite: true,
  },
  {
    id: '4',
    title: 'Economic Implications of Renewable Energy Transitions',
    authors: ['Patel, R.'],
    year: '2020',
    type: 'conference',
    summary: 'A conference paper analyzing economic costs and benefits of transitioning to renewable energy sources, with case studies from various countries and market sectors.',
    tags: ['economics', 'renewable energy', 'sustainability', 'policy'],
    hasPdf: true,
    discipline: 'Economics',
    usageCount: 2,
    dateAdded: new Date('2023-06-05'),
    isFavorite: false,
  },
];

type FilterOptions = {
  type: string;
  discipline: string;
  year: string;
};

interface KnowledgeBaseProps {
  searchQuery: string;
}

const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ searchQuery }) => {
  const [sortBy, setSortBy] = useState<string>('recent');
  const [filters, setFilters] = useState<FilterOptions>({
    type: 'all',
    discipline: 'all',
    year: 'all'
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Get unique values for filter dropdowns
  const disciplines = ['all', ...Array.from(new Set(MOCK_SOURCES.map(s => s.discipline)))];
  const types = ['all', ...Array.from(new Set(MOCK_SOURCES.map(s => s.type)))];
  const years = ['all', ...Array.from(new Set(MOCK_SOURCES.map(s => s.year))).sort((a, b) => parseInt(b) - parseInt(a))];
  
  // Filter sources based on search query and filters
  const filteredSources = MOCK_SOURCES.filter(source => {
    // Search filter
    const matchesSearch = 
      source.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.authors.some(author => author.toLowerCase().includes(searchQuery.toLowerCase())) ||
      source.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      source.summary.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Dropdown filters
    const matchesType = filters.type === 'all' || source.type === filters.type;
    const matchesDiscipline = filters.discipline === 'all' || source.discipline === filters.discipline;
    const matchesYear = filters.year === 'all' || source.year === filters.year;
    
    return matchesSearch && matchesType && matchesDiscipline && matchesYear;
  });
  
  // Sort sources based on selected sort option
  const sortedSources = [...filteredSources].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'usage':
        return b.usageCount - a.usageCount;
      case 'recent':
      default:
        return b.dateAdded.getTime() - a.dateAdded.getTime();
    }
  });
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric'
    });
  };
  
  const formatAuthors = (authors: string[]) => {
    if (authors.length === 1) return authors[0];
    if (authors.length === 2) return `${authors[0]} & ${authors[1]}`;
    return `${authors[0]} et al.`;
  };
  
  const handleToggleFavorite = (id: string) => {
    // In a real app, this would toggle favorite status
    console.log(`Toggle favorite for source ${id}`);
  };
  
  const handleDeleteSource = (id: string) => {
    // In a real app, this would delete the source
    console.log(`Delete source ${id}`);
  };
  
  const handleDownloadPdf = (id: string) => {
    // In a real app, this would download the PDF
    console.log(`Download PDF for source ${id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-xl font-semibold">Reference Library</h2>
        
        <div className="flex flex-wrap gap-2">
          <Select value={filters.discipline} onValueChange={(value) => setFilters({...filters, discipline: value})}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Discipline" />
            </SelectTrigger>
            <SelectContent>
              {disciplines.map(discipline => (
                <SelectItem key={discipline} value={discipline}>
                  {discipline === 'all' ? 'All Disciplines' : discipline}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Source Type" />
            </SelectTrigger>
            <SelectContent>
              {types.map(type => (
                <SelectItem key={type} value={type}>
                  {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filters.year} onValueChange={(value) => setFilters({...filters, year: value})}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={year}>
                  {year === 'all' ? 'All Years' : year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="usage">Most Used</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex rounded-md overflow-hidden border">
            <Button 
              variant={viewMode === 'grid' ? 'default' : 'outline'} 
              size="sm" 
              className="rounded-none"
              onClick={() => setViewMode('grid')}
            >
              <div className="grid grid-cols-2 gap-0.5 h-4 w-4">
                <div className="bg-current"></div>
                <div className="bg-current"></div>
                <div className="bg-current"></div>
                <div className="bg-current"></div>
              </div>
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'default' : 'outline'} 
              size="sm" 
              className="rounded-none"
              onClick={() => setViewMode('list')}
            >
              <div className="flex flex-col gap-0.5 h-4 w-4 justify-center">
                <div className="h-0.5 w-full bg-current"></div>
                <div className="h-0.5 w-full bg-current"></div>
                <div className="h-0.5 w-full bg-current"></div>
              </div>
            </Button>
          </div>
        </div>
      </div>
      
      {sortedSources.length === 0 ? (
        <div className="text-center py-12 border rounded-md bg-gray-50">
          <Book className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No references found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || filters.type !== 'all' || filters.discipline !== 'all' || filters.year !== 'all' 
              ? 'Try different search terms or filters' 
              : 'Start by adding references from your documents'}
          </p>
        </div>
      ) : (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedSources.map((source) => (
              <HoverCard key={source.id} openDelay={200} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-2">
                          {source.isFavorite && (
                            <Star className="h-4 w-4 text-yellow-400 mt-1 flex-shrink-0" />
                          )}
                          <h3 className="font-medium text-md line-clamp-2">{source.title}</h3>
                        </div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-48" align="end">
                            <div className="flex flex-col space-y-1">
                              {source.hasPdf && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="justify-start" 
                                  onClick={() => handleDownloadPdf(source.id)}
                                >
                                  <Download className="mr-2 h-4 w-4" />
                                  Download PDF
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="justify-start" 
                                onClick={() => handleToggleFavorite(source.id)}
                              >
                                <Star className={`mr-2 h-4 w-4 ${source.isFavorite ? 'text-yellow-400' : ''}`} />
                                {source.isFavorite ? 'Remove Favorite' : 'Add Favorite'}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="justify-start text-red-600" 
                                onClick={() => handleDeleteSource(source.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div className="text-sm text-gray-600 mt-1 mb-2">
                        {formatAuthors(source.authors)}, {source.year}
                      </div>
                      
                      <div className="flex gap-1 mb-3">
                        <Badge variant="outline" className="text-xs bg-gray-100">
                          {source.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-gray-100">
                          {source.discipline}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {source.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {source.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{source.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center">
                          {source.hasPdf ? (
                            <FileText className="h-3 w-3 mr-1 text-blue-500" />
                          ) : (
                            <ExternalLink className="h-3 w-3 mr-1" />
                          )}
                          {source.hasPdf ? 'PDF Available' : 'External Source'}
                        </div>
                        <div className="flex items-center">
                          Used in {source.usageCount} document{source.usageCount !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </HoverCardTrigger>
                <HoverCardContent className="w-80 p-4">
                  <h4 className="font-semibold">{source.title}</h4>
                  <p className="text-sm text-gray-600 mt-2">
                    <span className="font-medium">Authors:</span> {source.authors.join(', ')}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Published:</span> {source.year}, {source.type}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">{source.summary}</p>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-1 mb-2">
                      <TagIcon className="h-3 w-3 text-gray-500" />
                      <span className="text-xs text-gray-600">Tags:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {source.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            ))}
          </div>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[400px]">Source</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Discipline</TableHead>
                  <TableHead>Uses</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedSources.map((source) => (
                  <TableRow key={source.id}>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        {source.isFavorite && (
                          <Star className="h-4 w-4 text-yellow-400 mt-1 flex-shrink-0" />
                        )}
                        <div>
                          <HoverCard>
                            <HoverCardTrigger className="font-medium text-blue-700 hover:underline cursor-pointer">
                              {source.title}
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80 p-4">
                              <h4 className="font-semibold">{source.title}</h4>
                              <p className="text-sm text-gray-600 mt-2">
                                <span className="font-medium">Authors:</span> {source.authors.join(', ')}
                              </p>
                              <p className="text-sm text-gray-600 mt-2">{source.summary}</p>
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="flex items-center gap-1 mb-2">
                                  <TagIcon className="h-3 w-3 text-gray-500" />
                                  <span className="text-xs text-gray-600">Tags:</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {source.tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                          <div className="text-sm text-gray-500">
                            {formatAuthors(source.authors)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {source.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{source.year}</TableCell>
                    <TableCell>{source.discipline}</TableCell>
                    <TableCell>{source.usageCount}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {source.hasPdf && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleDownloadPdf(source.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleToggleFavorite(source.id)}
                        >
                          <Star className={`h-4 w-4 ${source.isFavorite ? 'text-yellow-400' : ''}`} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-600" 
                          onClick={() => handleDeleteSource(source.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )
      )}
    </div>
  );
};

export default KnowledgeBase;
