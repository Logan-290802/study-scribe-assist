
import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, FileText, Image, FileUp, Download, ExternalLink, Copy } from 'lucide-react';
import { KnowledgeBaseItem as KBItem } from '@/services/KnowledgeBaseService';
import { getFilePublicUrl } from '@/services/KnowledgeBaseService';
import { useToast } from '@/components/ui/use-toast';

interface KnowledgeBaseItemProps {
  item: KBItem;
  onDelete: (id: string) => Promise<void>;
}

const KnowledgeBaseItem: React.FC<KnowledgeBaseItemProps> = ({ item, onDelete }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { toast } = useToast();
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      await onDelete(item.id);
    }
  };

  const handleView = () => {
    if (!item.file_path) return;
    const publicUrl = getFilePublicUrl(item.file_path);
    window.open(publicUrl, '_blank');
  };

  const handleCopyReference = () => {
    let formattedRef = '';
    
    switch (item.format) {
      case 'APA':
        formattedRef = `${item.authors?.join(', ')} (${item.year}). ${item.title}. ${item.source}.`;
        break;
      case 'MLA':
        formattedRef = `${item.authors?.join(', ')}. "${item.title}." ${item.source}, ${item.year}.`;
        break;
      case 'Harvard':
        formattedRef = `${item.authors?.join(', ')} ${item.year}, '${item.title}', ${item.source}.`;
        break;
      default:
        formattedRef = `${item.title} - ${item.authors?.join(', ')} (${item.year})`;
    }
    
    navigator.clipboard.writeText(formattedRef)
      .then(() => {
        toast({
          title: 'Reference Copied',
          description: 'Reference details copied to clipboard',
        });
      })
      .catch(err => {
        console.error('Could not copy reference: ', err);
        toast({
          title: 'Copy Failed',
          description: 'Unable to copy reference',
          variant: 'destructive',
        });
      });
  };

  // Determine the icon based on the file type
  const getItemIcon = () => {
    if (!item.file_path) return <FileText className="h-5 w-5" />;
    
    const fileType = item.file_type?.toLowerCase() || '';
    
    if (fileType.includes('image')) {
      return <Image className="h-5 w-5" />;
    } else if (fileType.includes('pdf')) {
      return <FileText className="h-5 w-5" />;
    } else {
      return <FileUp className="h-5 w-5" />;
    }
  };
  
  const isImage = item.file_type?.toLowerCase().includes('image');
  const imageUrl = isImage ? getFilePublicUrl(item.file_path!) : '';

  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex-grow">
        {isImage && !imageError && (
          <div className="mb-4 relative aspect-video w-full overflow-hidden rounded bg-gray-100">
            {!isImageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-300"></div>
              </div>
            )}
            <img 
              src={imageUrl} 
              alt={item.title}
              className={`w-full h-full object-cover transition-opacity ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setIsImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </div>
        )}
        
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-gray-100 text-gray-600">
            {getItemIcon()}
          </div>
          <div className="flex-grow">
            <h3 
              className={`font-medium truncate mb-1 ${item.file_path ? 'cursor-pointer hover:text-blue-600' : ''}`}
              onClick={item.file_path ? handleView : undefined}
            >
              {item.title}
            </h3>
            {item.authors && item.authors.length > 0 && (
              <p className="text-sm text-gray-500 mb-1">
                {item.authors.join(', ')}
                {item.year && ` (${item.year})`}
              </p>
            )}
            {item.source && (
              <p className="text-sm text-gray-500 mb-1">{item.source}</p>
            )}
          </div>
        </div>
        
        <div className="mt-3 text-sm text-gray-700 line-clamp-3">
          {item.content}
        </div>
        
        {item.file_path && (
          <div className="mt-2 flex items-center text-xs text-gray-500">
            <FileUp className="h-3 w-3 mr-1" />
            <span className="truncate">
              {item.file_path.split('/').pop()}
            </span>
          </div>
        )}
        
        {item.url && (
          <div className="mt-2 flex items-center text-xs text-blue-500">
            <ExternalLink className="h-3 w-3 mr-1" />
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="truncate hover:underline">
              {item.url}
            </a>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-3 pt-0 flex justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleDelete}
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
        
        <div className="flex gap-2">
          {item.file_path && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleView}
              className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
            >
              <Download className="h-4 w-4 mr-1" />
              View
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleCopyReference}
            className="text-green-500 hover:text-green-700 hover:bg-green-50"
          >
            <Copy className="h-4 w-4 mr-1" />
            Copy
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default KnowledgeBaseItem;
