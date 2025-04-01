
import React from 'react';
import { File, X, Image as ImageIcon } from 'lucide-react';

interface UploadedFileProps {
  file: File | { name: string; path?: string; type?: string };
  onRemove: () => void;
}

export const UploadedFile: React.FC<UploadedFileProps> = ({ file, onRemove }) => {
  // Get file name and type from the file object
  const fileName = file.name;
  const fileType = 'type' in file ? file.type : '';
  
  // Determine if file is an image
  const isImage = fileType && fileType.startsWith('image/');

  return (
    <div className="flex justify-center animate-fade-in">
      <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-3 flex items-center gap-2">
        {isImage ? (
          <ImageIcon className="h-5 w-5 text-blue-500" />
        ) : (
          <File className="h-5 w-5 text-blue-500" />
        )}
        <span className="text-sm font-medium">{fileName}</span>
        <button 
          onClick={onRemove}
          className="ml-2 p-1 rounded-full hover:bg-blue-100"
        >
          <X className="h-4 w-4 text-blue-500" />
        </button>
      </div>
    </div>
  );
};

export default UploadedFile;
