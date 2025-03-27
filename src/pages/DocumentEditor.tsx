
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import TextEditor from '@/components/editor/TextEditor';
import AiChat, { Reference } from '@/components/ai/AiChat';
import DocumentTitle from '@/components/editor/DocumentTitle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import ReferenceManager from '@/components/references/ReferenceManager';
import ExportPanel from '@/components/export/ExportPanel';
import { useDocuments } from '@/store/DocumentStore';

const DocumentEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getDocument } = useDocuments();

  const document = id ? getDocument(id) : undefined;

  const [documentTitle, setDocumentTitle] = useState(document?.title || 'Untitled Document');
  const [documentContent, setDocumentContent] = useState(document?.content || '');
  const [references, setReferences] = useState<Reference[]>([]);
  const [aiChatHistory, setAiChatHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: 'Hello! I\'m your AI research assistant. How can I help you today?' }
  ]);
  
  // Update state when document changes
  useEffect(() => {
    if (document) {
      setDocumentTitle(document.title);
      setDocumentContent(document.content || '');
    }
  }, [document]);
  
  const handleSave = () => {
    toast({
      title: "Document saved",
      description: "Your document has been saved successfully.",
    });
  };

  const handleAiAction = (action: string, selection: string) => {
    // Add the user's request to the chat history
    const userQuery = `Please ${action} the following text: "${selection}"`;
    setAiChatHistory([...aiChatHistory, { role: 'user', content: userQuery }]);
    
    // Simulate AI response (in a real app, this would call an API)
    setTimeout(() => {
      let response;
      switch (action) {
        case 'elaborate':
          response = `I've expanded on your selection by adding more context and details. "${selection}" could be enhanced with additional supporting evidence...`;
          break;
        case 'summarize':
          response = `Here's a concise summary of your text: The main point of "${selection}" is...`;
          break;
        case 'research':
          response = `Based on my research about "${selection}", here are some relevant facts and sources: ...`;
          break;
        default:
          response = `I've analyzed "${selection}" as requested.`;
      }
      
      setAiChatHistory(prevHistory => [...prevHistory, { role: 'assistant', content: response }]);
    }, 1000);
  };
  
  const handleAddReference = (reference: Reference) => {
    setReferences([...references, reference]);
    toast({
      title: "Reference added",
      description: `${reference.title} has been added to your references.`,
    });
  };
  
  const handleDeleteReference = (referenceId: string) => {
    setReferences(references.filter(ref => ref.id !== referenceId));
    toast({
      title: "Reference removed",
      description: "The reference has been removed from your document.",
    });
  };

  if (!document) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-full">
          <h1 className="text-2xl font-bold mb-4">Document not found</h1>
          <Button onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <DocumentTitle 
              title={documentTitle}
              onTitleChange={setDocumentTitle}
            />
          </div>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <TextEditor
              initialContent={documentContent}
              onContentChange={setDocumentContent}
              onSelectionAction={handleAiAction}
            />
            
            <Tabs defaultValue="references" className="mt-4">
              <TabsList className="mb-2">
                <TabsTrigger value="references">References ({references.length})</TabsTrigger>
                <TabsTrigger value="export">Export Options</TabsTrigger>
              </TabsList>
              <TabsContent value="references" className="p-4 border rounded-md">
                <ReferenceManager
                  references={references}
                  onDeleteReference={handleDeleteReference}
                />
              </TabsContent>
              <TabsContent value="export" className="p-4 border rounded-md">
                <ExportPanel documentTitle={documentTitle} />
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="lg:col-span-1">
            <AiChat
              chatHistory={aiChatHistory}
              onNewMessage={(message) => {
                setAiChatHistory([...aiChatHistory, { role: 'user', content: message }]);
                // Simulate AI response (in a real app, this would call an API)
                setTimeout(() => {
                  setAiChatHistory(prevHistory => [
                    ...prevHistory,
                    { 
                      role: 'assistant', 
                      content: `I'll help you with "${message}". Here's what I found...` 
                    }
                  ]);
                }, 1000);
              }}
              onAddReference={handleAddReference}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DocumentEditor;
