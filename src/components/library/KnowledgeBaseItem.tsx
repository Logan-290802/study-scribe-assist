
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { File, FileText, Image, Trash2 } from 'lucide-react';
import { KnowledgeBaseItem as KnowledgeBaseItemType } from '@/services/KnowledgeBaseService';
import { cn } from '@/lib/utils';

interface KnowledgeBaseItemProps {
  item: KnowledgeBaseItemType;
  onDelete: (id: string) => void;
  className?: string;
}

const KnowledgeBaseItem: React.FC<KnowledgeBaseItemProps> = ({ 
  item, 
  onDelete,
  className
}) => {
  const isFile = !!item.file_path;
  const isImage = item.file_type?.startsWith('image/');
  const isPdf = item.file_type === 'application/pdf';
  
  // Format the date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(item.id);
  };

  return (
    <Card className={cn("transition-all hover:shadow-md", className)}>
      <CardContent className="p-4 flex gap-3">
        <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-md bg-blue-100 text-blue-600">
          {isFile ? (
            isImage ? (
              <Image className="w-5 h-5" />
            ) : isPdf ? (
              <FileText className="w-5 h-5" />
            ) : (
              <File className="w-5 h-5" />
            )
          ) : (
            <FileText className="w-5 h-5" />
          )}
        </div>
        
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <h3 className="font-medium mb-1 text-blue-600">{item.title}</h3>
            <button 
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title="Remove from knowledge base"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          
          {item.authors && item.authors.length > 0 && (
            <p className="text-sm text-gray-600 mb-1">
              By: {item.authors.join(', ')} {item.year && `(${item.year})`}
            </p>
          )}
          
          {item.source && (
            <p className="text-sm text-gray-600 mb-1">Source: {item.source}</p>
          )}
          
          {item.content && (
            <p className="text-sm text-gray-600 line-clamp-2">{item.content}</p>
          )}
          
          <div className="text-xs text-gray-400 mt-2">Added: {formatDate(item.created_at)}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default KnowledgeBaseItem;
