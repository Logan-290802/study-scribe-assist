
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import TextEditor from '@/components/editor/TextEditor';
import AiChat, { Reference } from '@/components/ai/AiChat';
import ReferenceManager from '@/components/references/ReferenceManager';
import DocumentTitle from '@/components/editor/DocumentTitle';
import ExportPanel from '@/components/export/ExportPanel';

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

  const handleAddReference = (reference: Reference) => {
    setReferences(prev => [...prev, reference]);
  };

  const handleDeleteReference = (id: string) => {
    setReferences(prev => prev.filter(ref => ref.id !== id));
  };

  const handleAiAction = (action: 'research' | 'expand' | 'critique', selectedText: string) => {
    // The actual implementation is in the AiChat component
    // Here we just need to add the action to aiChatHistory so it appears in export
    let actionDescription = '';
    switch (action) {
      case 'research':
        actionDescription = 'find supporting research for';
        break;
      case 'expand':
        actionDescription = 'expand on';
        break;
      case 'critique':
        actionDescription = 'critique';
        break;
    }
    
    const newMessage = { 
      role: 'user' as const, 
      content: `Please ${actionDescription} the following text: "${selectedText}"`
    };
    
    setAiChatHistory(prev => [...prev, newMessage]);
  };

  return (
    <Layout>
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
    </Layout>
  );
};

export default Index;
