
import React from 'react';
import { Download, Eye, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface ExportActionsProps {
  documentTitle: string;
  documentContent: string;
  references: any[];
  aiChatHistory: { role: 'user' | 'assistant'; content: string }[];
  isExporting: boolean;
  exportSuccess: boolean;
  selectedFormat: 'docx' | 'pdf';
  onExport: () => void;
}

const ExportActions: React.FC<ExportActionsProps> = ({
  documentTitle,
  documentContent,
  references,
  aiChatHistory,
  isExporting,
  exportSuccess,
  selectedFormat,
  onExport,
}) => {
  return (
    <div className="flex gap-2">
      <Link
        to="/preview-export"
        state={{ documentTitle, documentContent, references, aiChatHistory }}
        className="flex-1 py-2.5 flex justify-center items-center gap-2 border border-blue-600 text-blue-600 bg-white hover:bg-blue-50 rounded transition-colors"
      >
        <Eye className="w-5 h-5" />
        <span>Preview</span>
      </Link>
      
      <button
        onClick={onExport}
        disabled={isExporting || exportSuccess}
        className={cn(
          "flex-1 py-2.5 flex justify-center items-center gap-2 text-white rounded transition-colors",
          (isExporting || exportSuccess) 
            ? "bg-blue-400" 
            : "bg-blue-600 hover:bg-blue-700"
        )}
      >
        {isExporting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Exporting...</span>
          </>
        ) : exportSuccess ? (
          <>
            <CheckCircle className="w-5 h-5" />
            <span>Exported!</span>
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            <span>{selectedFormat === 'docx' ? 'Export Word' : 'Export PDF'}</span>
          </>
        )}
      </button>
    </div>
  );
};

export default ExportActions;
