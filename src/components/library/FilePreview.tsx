
import { useState, useEffect } from 'react';
import { FileText, Image as ImageIcon, FileUp } from 'lucide-react';
import { getFileIcon, getPublicImageUrl } from '@/utils/file-utils';

interface FilePreviewProps {
  filePath?: string;
  fileType?: string;
  title: string;
  onClick?: () => void;
}

export const FilePreview = ({ filePath, fileType, title, onClick }: FilePreviewProps) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  
  const isImage = fileType?.toLowerCase().includes('image');
  
  useEffect(() => {
    let isMounted = true;
    
    const loadImage = async () => {
      if (isImage && filePath) {
        try {
          const url = await getPublicImageUrl(filePath);
          if (isMounted && url) {
            console.log('Image URL loaded:', url);
            setImageUrl(url);
          }
        } catch (error) {
          if (isMounted) {
            console.error('Error loading image URL:', error);
            setImageError(true);
          }
        }
      }
    };
    
    loadImage();
    
    return () => {
      isMounted = false;
    };
  }, [isImage, filePath]);

  const getIconComponent = () => {
    const iconType = getFileIcon(filePath, fileType);
    switch (iconType) {
      case 'image':
        return <ImageIcon className="h-5 w-5" />;
      case 'text':
        return <FileText className="h-5 w-5" />;
      default:
        return <FileUp className="h-5 w-5" />;
    }
  };

  return (
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-full bg-gray-100 text-gray-600">
        {getIconComponent()}
      </div>
      {isImage && !imageError && imageUrl && (
        <div className="mb-4 relative aspect-video w-full overflow-hidden rounded bg-gray-100">
          {!isImageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-300"></div>
            </div>
          )}
          <img 
            src={imageUrl} 
            alt={title}
            className={`w-full h-full object-cover transition-opacity ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setIsImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        </div>
      )}
    </div>
  );
};
