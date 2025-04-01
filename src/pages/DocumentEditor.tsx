
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import DocumentHeader from '@/components/document/DocumentHeader';
import EditorArea from '@/components/document/EditorArea';
import DocumentToolsPanel from '@/components/document/DocumentToolsPanel';
import ChatSidebar from '@/components/document/ChatSidebar';
import { useDocumentData } from '@/hooks/useDocumentData';
import { useDocumentAiChat } from '@/hooks/useDocumentAiChat';
import { useReferenceManagement } from '@/hooks/useReferenceManagement';
import { aiServiceManager } from '@/services/ai/AiServiceManager';
import { ChatInputProvider } from '@/contexts/ChatInputContext';

const DocumentEditor = () => {
  const navigate = useNavigate();
  
  // Load document data and references
  const {
    id,
    user,
    document,
    documentTitle,
    setDocumentTitle,
    documentContent,
    setDocumentContent,
    references,
    setReferences,
    isSaving,
    handleSave
  } = useDocumentData();
  
  // AI chat functionality
  const {
    aiChatHistory,
    setAiChatHistory,
    handleAiAction
  } = useDocumentAiChat(id, user?.id);
  
  // Reference management
  const {
    handleAddReference,
    handleDeleteReference
  } = useReferenceManagement(
    id, 
    user?.id, 
    references, 
    setReferences, 
    document?.id ? handleSave : () => Promise.resolve()
  );
  
  // Initialize AI services with API keys from localStorage
  useEffect(() => {
    const perplexityKey = localStorage.getItem('perplexity_api_key');
    const openaiKey = localStorage.getItem('openai_api_key');
    const claudeKey = localStorage.getItem('claude_api_key');
    
    const manager = (aiServiceManager as any);
    if (manager && typeof manager.constructor === 'function') {
      // Reinitialize with the saved keys
      Object.assign(manager, new manager.constructor({
        perplexity: perplexityKey || undefined,
        openai: openaiKey || undefined,
        claude: claudeKey || undefined
      }));
    }
  }, []);

  if (!document) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-full">
          <h1 className="text-2xl font-bold mb-4">Document not found</h1>
          <button onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ChatInputProvider>
        <div className="container mx-auto px-4 py-6 space-y-6 max-w-full">
          <DocumentHeader 
            documentTitle={documentTitle}
            onTitleChange={setDocumentTitle}
            onSave={handleSave}
            isSaving={isSaving}
          />
          
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-8 space-y-6">
              <EditorArea 
                content={documentContent}
                onChange={setDocumentContent}
                onAiAction={handleAiAction}
              />
              
              <DocumentToolsPanel
                references={references}
                documentTitle={documentTitle}
                documentContent={documentContent}
                aiChatHistory={aiChatHistory}
                onAddReference={handleAddReference}
                onDeleteReference={handleDeleteReference}
              />
            </div>
            
            <div className="col-span-12 lg:col-span-4">
              <ChatSidebar 
                documentId={id || ''}
                onAddReference={handleAddReference}
                chatHistory={aiChatHistory}
                setChatHistory={setAiChatHistory}
                userId={user?.id}
              />
            </div>
          </div>
        </div>
      </ChatInputProvider>
    </Layout>
  );
};

export default DocumentEditor;
