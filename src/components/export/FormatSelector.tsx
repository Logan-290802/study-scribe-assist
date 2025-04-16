
import React from 'react';
import { FileText, File } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormatSelectorProps {
  selectedFormat: 'docx' | 'pdf';
  onFormatChange: (format: 'docx' | 'pdf') => void;
}

const FormatSelector: React.FC<FormatSelectorProps> = ({
  selectedFormat,
  onFormatChange,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Export Format</label>
      <div className="flex gap-2">
        <button
          onClick={() => onFormatChange('docx')}
          className={cn(
            "flex-1 py-2 px-3 border rounded-md flex items-center justify-center gap-2 transition-colors",
            selectedFormat === 'docx' 
              ? "bg-blue-50 border-blue-200 text-blue-700" 
              : "bg-white hover:bg-gray-50"
          )}
        >
          <FileText className="w-4 h-4" />
          <span>Word (DOCX)</span>
        </button>
        
        <button
          onClick={() => onFormatChange('pdf')}
          className={cn(
            "flex-1 py-2 px-3 border rounded-md flex items-center justify-center gap-2 transition-colors",
            selectedFormat === 'pdf' 
              ? "bg-blue-50 border-blue-200 text-blue-700" 
              : "bg-white hover:bg-gray-50"
          )}
        >
          <File className="w-4 h-4" />
          <span>PDF</span>
        </button>
      </div>
    </div>
  );
};

export default FormatSelector;
