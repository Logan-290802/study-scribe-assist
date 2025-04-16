
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Reference } from '@/components/ai';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, FileText, History, Printer } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import DocumentPreview from '@/components/export/DocumentPreview';

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
            <Button variant="outline" className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              <span>Print</span>
            </Button>
            <Button className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span>Download</span>
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
