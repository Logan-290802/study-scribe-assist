
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, FileText, Image, FileUp, Download } from 'lucide-react';
import { KnowledgeBaseItem as KBItem } from '@/services/KnowledgeBaseService';
import { getFilePublicUrl } from '@/services/KnowledgeBaseService';

interface KnowledgeBaseItemProps {
  item: KBItem;
  onDelete: (id: string) => Promise<void>;
}

const KnowledgeBaseItem: React.FC<KnowledgeBaseItemProps> = ({ item, onDelete }) => {
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      await onDelete(item.id);
    }
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
  
  // Handle download for file items
  const handleDownload = () => {
    if (!item.file_path) return;
    
    const publicUrl = getFilePublicUrl(item.file_path);
    window.open(publicUrl, '_blank');
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex-grow">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-gray-100 text-gray-600">
            {getItemIcon()}
          </div>
          <div>
            <h3 className="font-medium truncate mb-1">{item.title}</h3>
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
        
        {item.file_path && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleDownload}
            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
          >
            <Download className="h-4 w-4 mr-1" />
            View
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default KnowledgeBaseItem;
