
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
  Download,
  Copy
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useKnowledgeBaseStore } from '@/store/KnowledgeBaseStore';
import { KnowledgeBaseReference } from '@/types/knowledgeBase.types';
import { supabase } from '@/lib/supabase';

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
  const [referenceToDelete, setReferenceToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Use references from our KnowledgeBase store
  const { references, loading, deleteReference, toggleFavorite } = useKnowledgeBaseStore();
  
  // Extract unique values for filters
  const disciplines = ['all', ...Array.from(new Set(references.map(s => s.discipline)))].filter(Boolean);
  const types = ['all', ...Array.from(new Set(references.map(s => s.type)))];
  const years = ['all', ...Array.from(new Set(references.map(s => s.year))).sort((a, b) => parseInt(b) - parseInt(a))];
  
  // Filter references based on search and filters
  const filteredReferences = references.filter(reference => {
    const matchesSearch = 
      reference.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reference.authors.some(author => author.toLowerCase().includes(searchQuery.toLowerCase())) ||
      reference.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (reference.summary && reference.summary.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = filters.type === 'all' || reference.type === filters.type;
    const matchesDiscipline = filters.discipline === 'all' || reference.discipline === filters.discipline;
    const matchesYear = filters.year === 'all' || reference.year === filters.year;
    
    return matchesSearch && matchesType && matchesDiscipline && matchesYear;
  });
  
  // Sort references
  const sortedReferences = [...filteredReferences].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'usage':
        return b.usage_count - a.usage_count;
      case 'recent':
      default:
        return b.date_added.getTime() - a.date_added.getTime();
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
    if (authors.length === 0) return 'Unknown';
    if (authors.length === 1) return authors[0];
    if (authors.length === 2) return `${authors[0]} & ${authors[1]}`;
    return `${authors[0]} et al.`;
  };
  
  const formatCitation = (reference: KnowledgeBaseReference): string => {
    const authorText = reference.authors.length > 0 ? reference.authors.join(', ') : 'Unknown';
    const citation = `${authorText} (${reference.year}). ${reference.title}. ${reference.type === 'journal' ? reference.discipline : reference.type}.`;
    return citation;
  };
  
  const confirmDelete = (id: string) => {
    setReferenceToDelete(id);
  };
  
  const handleDeleteConfirmed = async () => {
    if (referenceToDelete) {
      try {
        await deleteReference(referenceToDelete);
        setReferenceToDelete(null);
      } catch (error) {
        console.error('Error deleting reference:', error);
      }
    }
  };
  
  const handleDeleteCancelled = () => {
    setReferenceToDelete(null);
  };
  
  const handleDownloadPdf = async (id: string) => {
    const reference = references.find(r => r.id === id);
    if (reference && reference.pdf_path) {
      try {
        toast({
          title: "Download started",
          description: `Downloading "${reference.title}" PDF.`,
        });
        
        // Get a signed URL for the file
        const { data, error } = await supabase.storage
          .from('uploads')
          .createSignedUrl(reference.pdf_path, 60); // 60 seconds expiry
          
        if (error) {
          throw error;
        }
        
        if (data?.signedUrl) {
          // Open the URL in a new tab
          window.open(data.signedUrl, '_blank');
        }
      } catch (error) {
        console.error('Error downloading file:', error);
        toast({
          title: "Download failed",
          description: "There was an error downloading the file.",
          variant: "destructive",
        });
      }
    }
  };
  
  const handleCopyReference = (id: string) => {
    const reference = references.find(r => r.id === id);
    if (reference) {
      const formattedCitation = formatCitation(reference);
      navigator.clipboard.writeText(formattedCitation)
        .then(() => {
          toast({
            title: "Reference copied",
            description: "Citation has been copied to clipboard.",
          });
        })
        .catch(err => {
          console.error('Could not copy citation: ', err);
          toast({
            title: "Copy failed",
            description: "Could not copy citation to clipboard.",
            variant: "destructive",
          });
        });
    }
  };

  // Render grid view
  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedReferences.map((reference) => (
        <HoverCard key={reference.id} openDelay={200} closeDelay={100}>
          <HoverCardTrigger asChild>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={`h-5 w-5 p-0 ${reference.is_favorite ? 'text-yellow-400' : 'text-gray-400'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(reference.id);
                      }}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                    <h3 className="font-medium text-md line-clamp-2">{reference.title}</h3>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48" align="end">
                      <div className="flex flex-col space-y-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="justify-start" 
                          onClick={() => handleCopyReference(reference.id)}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Citation
                        </Button>
                        {reference.has_pdf && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="justify-start" 
                            onClick={() => handleDownloadPdf(reference.id)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="justify-start" 
                          onClick={() => toggleFavorite(reference.id)}
                        >
                          <Star className={`mr-2 h-4 w-4 ${reference.is_favorite ? 'text-yellow-400' : ''}`} />
                          {reference.is_favorite ? 'Remove Favorite' : 'Add Favorite'}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="justify-start text-red-600" 
                          onClick={() => confirmDelete(reference.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="text-sm text-gray-600 mt-1 mb-2">
                  {formatAuthors(reference.authors)}, {reference.year}
                </div>
                
                <div className="flex gap-1 mb-3">
                  <Badge variant="outline" className="text-xs bg-gray-100">
                    {reference.type}
                  </Badge>
                  {reference.discipline && (
                    <Badge variant="outline" className="text-xs bg-gray-100">
                      {reference.discipline}
                    </Badge>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {reference.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {reference.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{reference.tags.length - 3}
                    </Badge>
                  )}
                </div>
                
                <div className="flex justify-between text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center">
                    {reference.has_pdf ? (
                      <FileText className="h-3 w-3 mr-1 text-blue-500" />
                    ) : (
                      <ExternalLink className="h-3 w-3 mr-1" />
                    )}
                    {reference.has_pdf ? 'PDF Available' : 'External Source'}
                  </div>
                  <div className="flex items-center">
                    Used in {reference.usage_count} document{reference.usage_count !== 1 ? 's' : ''}
                  </div>
                </div>
              </CardContent>
            </Card>
          </HoverCardTrigger>
          <HoverCardContent className="w-80 p-4">
            <h4 className="font-semibold">{reference.title}</h4>
            <p className="text-sm text-gray-600 mt-2">
              <span className="font-medium">Authors:</span> {reference.authors.length > 0 
                ? reference.authors.join(', ') 
                : 'Unknown'}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Published:</span> {reference.year}, {reference.type}
            </p>
            {reference.summary && (
              <p className="text-sm text-gray-600 mt-2">{reference.summary}</p>
            )}
            {reference.tags.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center gap-1 mb-2">
                  <TagIcon className="h-3 w-3 text-gray-500" />
                  <span className="text-xs text-gray-600">Tags:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {reference.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </HoverCardContent>
        </HoverCard>
      ))}
    </div>
  );

  // Render list view
  const renderListView = () => (
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
          {sortedReferences.map((reference) => (
            <TableRow key={reference.id}>
              <TableCell>
                <div className="flex items-start gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-5 w-5 p-0 ${reference.is_favorite ? 'text-yellow-400' : 'text-gray-400'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(reference.id);
                    }}
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                  <div>
                    <HoverCard>
                      <HoverCardTrigger className="font-medium text-blue-700 hover:underline cursor-pointer">
                        {reference.title}
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80 p-4">
                        <h4 className="font-semibold">{reference.title}</h4>
                        <p className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">Authors:</span> {reference.authors.length > 0 
                            ? reference.authors.join(', ') 
                            : 'Unknown'}
                        </p>
                        {reference.summary && (
                          <p className="text-sm text-gray-600 mt-2">{reference.summary}</p>
                        )}
                        {reference.tags.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center gap-1 mb-2">
                              <TagIcon className="h-3 w-3 text-gray-500" />
                              <span className="text-xs text-gray-600">Tags:</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {reference.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </HoverCardContent>
                    </HoverCard>
                    <div className="text-sm text-gray-500">
                      {formatAuthors(reference.authors)}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {reference.type}
                </Badge>
              </TableCell>
              <TableCell>{reference.year}</TableCell>
              <TableCell>{reference.discipline || '-'}</TableCell>
              <TableCell>{reference.usage_count}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleCopyReference(reference.id)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy Citation</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {reference.has_pdf && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleDownloadPdf(reference.id)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-8 w-8 ${reference.is_favorite ? 'text-yellow-400' : ''}`}
                    onClick={() => toggleFavorite(reference.id)}
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-red-600" 
                    onClick={() => confirmDelete(reference.id)}
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
  );

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
      
      {loading ? (
        <div className="text-center py-12 border rounded-md bg-gray-50">
          <Book className="mx-auto h-12 w-12 text-gray-400 mb-4 animate-pulse" />
          <h3 className="text-lg font-medium text-gray-900">Loading references...</h3>
        </div>
      ) : sortedReferences.length === 0 ? (
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
        viewMode === 'grid' ? renderGridView() : renderListView()
      )}
      
      <AlertDialog open={!!referenceToDelete} onOpenChange={() => !referenceToDelete && setReferenceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this reference from your library.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancelled}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirmed} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default KnowledgeBase;
