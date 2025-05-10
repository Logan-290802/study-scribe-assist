
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
import { useKnowledgeBase } from '@/hooks/useKnowledgeBase';
import { convertReferenceToKnowledgeBaseItem } from '@/services/KnowledgeBaseService';
import { ChatInputProvider } from '@/contexts/ChatInputContext';
import { useDocumentAutosave } from '@/hooks/useDocumentAutosave';

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
    handleSave,
    lastSaved
  } = useDocumentData();
  
  // Set up autosave
  const documentData = {
    title: documentTitle,
    content: documentContent,
    chatHistory: []
  };
  
  const { saveNow } = useDocumentAutosave(id, user?.id, documentData);
  
  // Effect to trigger save on content changes
  useEffect(() => {
    // This will trigger the autosave through the useDocumentAutosave hook
    console.log('Document content or title changed - autosave should trigger');
  }, [documentTitle, documentContent]);
  
  // AI chat functionality
  const {
    aiChatHistory,
    setAiChatHistory,
    handleAiAction
  } = useDocumentAiChat(id, user?.id);
  
  // Knowledge base integration
  const {
    addItem: addToKnowledgeBase
  } = useKnowledgeBase(user?.id);
  
  // Reference management with knowledge base integration
  const handleAddReferenceWithKnowledgeBase = async (reference) => {
    // First add to document references
    handleAddReference(reference);
    
    // Then add to knowledge base
    if (user?.id) {
      const knowledgeBaseItem = convertReferenceToKnowledgeBaseItem(reference, user.id);
      await addToKnowledgeBase(knowledgeBaseItem);
    }
  };
  
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
        <div className="container mx-auto px-4 py-6 space-y-6 max-w-full h-full">
          <DocumentHeader 
            documentTitle={documentTitle}
            onTitleChange={setDocumentTitle}
            onSave={saveNow || handleSave}
            isSaving={isSaving}
            lastSaved={lastSaved}
          />
          
          <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
            <div className="col-span-12 lg:col-span-8 space-y-6 flex flex-col">
              <div className="flex-grow overflow-hidden">
                <EditorArea 
                  content={documentContent}
                  onChange={setDocumentContent}
                  onAiAction={handleAiAction}
                />
              </div>
              
              <DocumentToolsPanel
                references={references}
                documentTitle={documentTitle}
                documentContent={documentContent}
                aiChatHistory={aiChatHistory}
                onAddReference={handleAddReferenceWithKnowledgeBase}
                onDeleteReference={handleDeleteReference}
              />
            </div>
            
            <div className="col-span-12 lg:col-span-4 h-full">
              <ChatSidebar 
                documentId={id || ''}
                onAddReference={handleAddReferenceWithKnowledgeBase}
                chatHistory={aiChatHistory}
                setChatHistory={setAiChatHistory}
                userId={user?.id}
                onAddToKnowledgeBase={addToKnowledgeBase}
              />
            </div>
          </div>
        </div>
      </ChatInputProvider>
    </Layout>
  );
};

export default DocumentEditor;
