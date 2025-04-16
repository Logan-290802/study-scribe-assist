
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Reference } from '@/components/ai';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, FileText, History, Printer, Loader2, CheckCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import DocumentPreview from '@/components/export/DocumentPreview';
import { generateDocx, generatePdf } from '@/utils/document-generator';
import { toast } from '@/components/ui/use-toast';

interface PreviewExportProps {
  documentTitle?: string;
  documentContent?: string;
  references?: Reference[];
  aiChatHistory?: { role: 'user' | 'assistant'; content: string }[];
}

const PreviewExport: React.FC<PreviewExportProps> = () => {
  const location = useLocation();
  const { documentTitle, documentContent, references, aiChatHistory } = 
    location.state || {
      documentTitle: "Sample Document",
      documentContent: "<p>No content available.</p>",
      references: [],
      aiChatHistory: []
    };
  
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'docx' | 'pdf'>('docx');

  const handleDownload = async () => {
    setIsExporting(true);
    
    try {
      let blob: Blob;
      
      if (selectedFormat === 'docx') {
        blob = await generateDocx(documentTitle, documentContent, references || [], aiChatHistory || []);
      } else {
        blob = await generatePdf(documentTitle, documentContent, references || [], aiChatHistory || []);
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
    <Layout>
      <div className="container mx-auto px-4 py-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Editor</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setSelectedFormat(selectedFormat === 'docx' ? 'pdf' : 'docx')}
            >
              {selectedFormat === 'docx' ? 'Switch to PDF' : 'Switch to Word'}
            </Button>
            <Button 
              onClick={handleDownload}
              disabled={isExporting || exportSuccess} 
              className="flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Exporting...</span>
                </>
              ) : exportSuccess ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Exported!</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>{selectedFormat === 'docx' ? 'Download Word' : 'Download PDF'}</span>
                </>
              )}
            </Button>
          </div>
        </div>
        
        <DocumentPreview
          title={documentTitle}
          content={documentContent}
          references={references || []}
          aiChatHistory={aiChatHistory || []}
        />
      </div>
    </Layout>
  );
};

export default PreviewExport;
