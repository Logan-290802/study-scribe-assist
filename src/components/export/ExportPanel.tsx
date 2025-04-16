
import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { Reference } from '../ai';
import { toast } from '@/components/ui/use-toast';
import { generateDocx, generatePdf } from '@/utils/document-generator';
import FormatSelector from './FormatSelector';
import DocumentStats from './DocumentStats';
import ExportActions from './ExportActions';

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

  const handleDownload = async () => {
    setIsExporting(true);
    
    try {
      let blob: Blob;
      
      if (selectedFormat === 'docx') {
        blob = await generateDocx(documentTitle, documentContent, references, aiChatHistory);
      } else {
        blob = await generatePdf(documentTitle, documentContent, references, aiChatHistory);
      }
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${documentTitle || 'document'}.${selectedFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setIsExporting(false);
      setExportSuccess(true);
      
      toast({
        title: 'Download Successful',
        description: `${documentTitle || 'Document'} has been downloaded as ${selectedFormat.toUpperCase()}.`,
      });
      
      setTimeout(() => {
        setExportSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Download Error',
        description: `Failed to download the document as ${selectedFormat.toUpperCase()}.`,
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
        <FormatSelector
          selectedFormat={selectedFormat}
          onFormatChange={setSelectedFormat}
        />
        
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
        
        <DocumentStats
          documentContent={documentContent}
          references={references}
          includeAiHistory={includeAiHistory}
          aiChatHistory={aiChatHistory}
        />
        
        <ExportActions
          documentTitle={documentTitle}
          documentContent={documentContent}
          references={references}
          aiChatHistory={aiChatHistory}
          isExporting={isExporting}
          exportSuccess={exportSuccess}
          selectedFormat={selectedFormat}
          onExport={handleDownload}
        />
      </div>
    </div>
  );
};

export default ExportPanel;
