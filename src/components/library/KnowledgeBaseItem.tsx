
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Download, ExternalLink } from 'lucide-react';
import { KnowledgeBaseItem as KBItem } from '@/services/KnowledgeBaseService';
import { useToast } from '@/components/ui/use-toast';
import { FilePreview } from './FilePreview';
import { ReferenceFormatter } from './ReferenceFormatter';
import { downloadAndOpenFile } from '@/utils/file-utils';

interface KnowledgeBaseItemProps {
  item: KBItem;
  onDelete: (id: string) => Promise<void>;
}

const KnowledgeBaseItem: React.FC<KnowledgeBaseItemProps> = ({ item, onDelete }) => {
  const { toast } = useToast();
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      await onDelete(item.id);
    }
  };

  const handleView = async () => {
    if (!item.file_path) return;
    await downloadAndOpenFile(item.file_path);
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex-grow">
        <FilePreview
          filePath={item.file_path}
          fileType={item.file_type}
          title={item.title}
          onClick={item.file_path ? handleView : undefined}
        />
        
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
        
        <div className="mt-3 text-sm text-gray-700 line-clamp-3">
          {item.content}
        </div>
        
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
          <ReferenceFormatter
            format={item.format || 'APA'}
            title={item.title}
            authors={item.authors}
            year={item.year}
            source={item.source}
          />
        </div>
      </CardFooter>
    </Card>
  );
};

export default KnowledgeBaseItem;
