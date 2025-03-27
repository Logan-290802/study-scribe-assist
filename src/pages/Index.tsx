
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import TextEditor from '@/components/editor/TextEditor';
import AiChat, { Reference } from '@/components/ai/AiChat';
import ReferenceManager from '@/components/references/ReferenceManager';
import DocumentTitle from '@/components/editor/DocumentTitle';
import ExportPanel from '@/components/export/ExportPanel';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase';

const initialContent = `<h1>Introduction</h1>
<p>Start writing your document here. You can format text using the toolbar above.</p>
<p>The AI assistant on the right can help you with:</p>
<ul>
  <li>Finding relevant research</li>
  <li>Suggesting references</li>
  <li>Summarizing complex topics</li>
  <li>Providing feedback on your writing</li>
</ul>`;

const Index = () => {
  const [documentTitle, setDocumentTitle] = useState('My Research Paper');
  const [documentContent, setDocumentContent] = useState(initialContent);
  const [references, setReferences] = useState<Reference[]>([]);
  const [aiChatHistory, setAiChatHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: 'Hello! I\'m your AI research assistant. How can I help you today?' }
  ]);
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(true);

  // No need to check environment variables, we're using hardcoded values
  // This check is here just to maintain compatibility with the code that expects it
  // In a real app, we would check environment variables, but we already have the values hardcoded
  React.useEffect(() => {
    if (!supabaseUrl || !supabaseAnonKey) {
      setIsSupabaseConfigured(false);
    }
  }, []);

  const handleAddReference = (reference: Reference) => {
    setReferences(prev => [...prev, reference]);
  };

  const handleDeleteReference = (id: string) => {
    setReferences(prev => prev.filter(ref => ref.id !== id));
  };

  const handleAiAction = (action: string, selectedText: string) => {
    // The actual implementation is in the AiChat component
    // Here we just need to add the action to aiChatHistory so it appears in export
    let actionDescription = '';
    switch (action) {
      case 'research':
        actionDescription = 'find supporting research for';
        break;
      case 'elaborate':
        actionDescription = 'expand on';
        break;
      case 'summarize':
        actionDescription = 'summarize';
        break;
      default:
        actionDescription = action;
    }
    
    const newMessage = { 
      role: 'user' as const, 
      content: `Please ${actionDescription} the following text: "${selectedText}"`
    };
    
    setAiChatHistory(prev => [...prev, newMessage]);
  };

  return (
    <Layout>
      {!isSupabaseConfigured && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Configuration Required</AlertTitle>
          <AlertDescription>
            <p className="mb-2">Supabase environment variables are missing. To use all features of this application, please:</p>
            <ol className="list-decimal ml-5 mb-2 space-y-1">
              <li>Create a Supabase project at <a href="https://app.supabase.io" target="_blank" rel="noreferrer" className="underline">supabase.io</a></li>
              <li>Add the following environment variables to your project:</li>
              <ul className="list-disc ml-5">
                <li>VITE_SUPABASE_URL - Your Supabase project URL</li>
                <li>VITE_SUPABASE_ANON_KEY - Your Supabase project anon/public key</li>
              </ul>
            </ol>
          </AlertDescription>
        </Alert>
      )}
      
      <DocumentTitle title={documentTitle} onTitleChange={setDocumentTitle} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col space-y-6">
          <div className="h-[500px]">
            <TextEditor 
              content={documentContent} 
              onChange={setDocumentContent} 
              onAiAction={handleAiAction}
            />
          </div>
          
          <ReferenceManager 
            references={references} 
            onAddReference={handleAddReference}
            onDeleteReference={handleDeleteReference}
          />
          
          <ExportPanel 
            documentContent={documentContent}
            documentTitle={documentTitle}
            references={references}
            aiChatHistory={aiChatHistory}
          />
        </div>
        
        <div className="h-[500px]">
          <AiChat onAddReference={handleAddReference} />
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <Link to="/dashboard">
          <Button>
            Go to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </Layout>
  );
};

export default Index;
