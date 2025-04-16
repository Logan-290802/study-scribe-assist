import React, { useState, useEffect } from 'react';
import { Download, File, FileText, History, CheckCircle, Loader2, Eye } from 'lucide-react';
import { Reference } from '../ai';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

interface ExportPanelProps {
  documentContent: string;
  documentTitle: string;
  references: Reference[];
  aiChatHistory: { role: 'user' | 'assistant'; content: string }[];
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  documentContent,
  documentTitle,
  references,
  aiChatHistory,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'docx' | 'pdf'>('docx');
  const [includeAiHistory, setIncludeAiHistory] = useState(true);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = documentContent;
    const text = tempElement.textContent || '';
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [documentContent]);

  const handleDownload = () => {
    setIsExporting(true);
    
    try {
      const blob = new Blob([documentContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${documentTitle || 'document'}.html`;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setIsExporting(false);
      setExportSuccess(true);
      
      toast({
        title: 'Download Successful',
        description: `${documentTitle || 'Document'} has been downloaded.`,
      });
      
      setTimeout(() => {
        setExportSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Download Error',
        description: 'Failed to download the document.',
        variant: 'destructive',
      });
      setIsExporting(false);
    }
  };

  return (
    <div className="border rounded-md overflow-hidden glass-card animate-fade-in">
      <div className="p-3 border-b bg-gray-50/80 backdrop-blur-sm flex items-center gap-2">
        <Download className="w-5 h-5 text-blue-500" />
        <h3 className="font-medium">Export Document</h3>
        <div className="ml-auto text-sm text-gray-500 flex items-center">
          <span className="mr-2">Word Count:</span>
          <span className="font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
            {wordCount}
          </span>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Export Format</label>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedFormat('docx')}
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
              onClick={() => setSelectedFormat('pdf')}
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
        
        <div>
          <div className="flex items-center">
            <input
              id="include-ai-history"
              type="checkbox"
              checked={includeAiHistory}
              onChange={() => setIncludeAiHistory(!includeAiHistory)}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="include-ai-history" className="ml-2 block text-sm text-gray-700">
              Include AI Chat History as Appendix
            </label>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            For transparency, your AI research assistance conversations will be included as an appendix.
          </p>
        </div>
        
        <div className="bg-gray-50 rounded-md p-3 text-sm">
          <h4 className="font-medium mb-1">Export will include:</h4>
          <ul className="space-y-1">
            <li className="flex items-center gap-1 text-gray-600">
              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
              Document Content ({documentContent.length > 0 ? 'Non-empty' : 'Empty'})
            </li>
            <li className="flex items-center gap-1 text-gray-600">
              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
              Bibliography ({references.length} references)
            </li>
            {includeAiHistory && (
              <li className="flex items-center gap-1 text-gray-600">
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                AI Chat History ({aiChatHistory.length} messages)
              </li>
            )}
          </ul>
        </div>
        
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
            onClick={handleDownload}
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
                <span>Export HTML</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportPanel;
