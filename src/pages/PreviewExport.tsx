
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Reference } from '@/components/ai';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, FileText, History, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PreviewExportProps {
  documentTitle?: string;
  documentContent?: string;
  references?: Reference[];
  aiChatHistory?: { role: 'user' | 'assistant'; content: string }[];
  includeAiHistory?: boolean;
}

const PreviewExport: React.FC<PreviewExportProps> = ({
  documentTitle = "My Research Paper",
  documentContent = "<p>This is a sample document content. In a real application, this would be populated with your actual document content.</p>",
  references = [],
  aiChatHistory = [],
  includeAiHistory = true
}) => {
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
        
        <div className="bg-white border rounded-lg shadow-sm p-8 max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-center mb-8">{documentTitle}</h1>
          
          <div 
            className="prose prose-sm sm:prose lg:prose-lg mx-auto mb-8"
            dangerouslySetInnerHTML={{ __html: documentContent }}
          />
          
          {references.length > 0 && (
            <div className="border-t pt-6 mt-8">
              <h2 className="text-xl font-semibold mb-4">References</h2>
              <ul className="space-y-2">
                {references.map((ref) => (
                  <li key={ref.id} className="text-sm text-gray-700">
                    {ref.authors.join(', ')} ({ref.year}). <em>{ref.title}</em>. {ref.source}.
                    {ref.url && <span> Retrieved from <a href={ref.url} className="text-blue-600 hover:underline">{ref.url}</a></span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {includeAiHistory && aiChatHistory.length > 0 && (
            <div className="border-t pt-6 mt-8">
              <h2 className="text-xl font-semibold mb-4">Appendix: AI Research Assistance</h2>
              <p className="text-sm text-gray-600 mb-4">This document was created with the assistance of an AI research tool. For transparency, the conversation history is included below:</p>
              
              <div className="bg-gray-50 rounded-md p-4 space-y-4">
                {aiChatHistory.map((msg, idx) => (
                  <div key={idx} className="text-sm">
                    <span className="font-medium">{msg.role === 'user' ? 'You: ' : 'AI Assistant: '}</span>
                    <span className="text-gray-700">{msg.content}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PreviewExport;
