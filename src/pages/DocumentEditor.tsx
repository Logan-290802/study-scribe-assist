
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import DocumentHeader from '@/components/document/DocumentHeader';
import EditorArea from '@/components/document/EditorArea';
import DocumentToolsPanel from '@/components/document/DocumentToolsPanel';
import ChatSidebar from '@/components/document/ChatSidebar';
import { useDocumentData } from '@/hooks/useDocumentData';
import { useDocumentAiChat } from '@/hooks/useDocumentAiChat';
import { useReferenceManagement } from '@/hooks/useReferenceManagement';
import { ChatInputProvider } from '@/contexts/ChatInputContext';
import { checkDatabaseTables, testDatabaseOperations } from '@/utils/database';
import { useToast } from '@/components/ui/use-toast';

const DocumentEditor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dbTestResults, setDbTestResults] = useState<any>(null);
  
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
  
  // Run database check when component mounts
  useEffect(() => {
    if (user?.id) {
      const runDatabaseTests = async () => {
        try {
          // First check the table structure
          const tableCheck = await checkDatabaseTables();
          console.log('Database structure check results:', tableCheck);
          
          // Only run operations test if required tables exist
          let operationsResults = {};
          if (tableCheck.documents && tableCheck.references) {
            operationsResults = await testDatabaseOperations(user.id);
            console.log('Database operations test results:', operationsResults);
          }
          
          // Combine results
          const combinedResults = {
            structure: tableCheck,
            operations: operationsResults
          };
          
          setDbTestResults(combinedResults);
          
          // Show toast with summary of results
          const missingTables = [];
          if (!tableCheck.documents) missingTables.push('documents');
          if (!tableCheck.references) missingTables.push('references');
          if (!tableCheck.ai_chat_history) missingTables.push('ai_chat_history');
          
          if (missingTables.length > 0) {
            toast({
              title: "Database check completed",
              description: `Missing tables: ${missingTables.join(', ')}. See console for details.`,
              variant: "destructive"
            });
          } else {
            toast({
              title: "Database check completed",
              description: "All tables exist! See console for detailed results.",
            });
          }
        } catch (error) {
          console.error('Error running database tests:', error);
          toast({
            title: "Database test error",
            description: "Error running database tests. See console for details.",
            variant: "destructive"
          });
        }
      };
      
      runDatabaseTests();
    }
  }, [user?.id, toast]);

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
              
              {dbTestResults && (
                <div className="p-4 bg-slate-50 rounded-md border text-sm">
                  <h3 className="font-medium mb-2">Database Test Results:</h3>
                  <div>
                    <p>
                      <strong>Documents Table:</strong> {dbTestResults.structure.documents ? '✅' : '❌'} 
                      {dbTestResults.operations?.documentsInsert && ' (Insert: ✅)'}
                      {dbTestResults.operations?.documentsQuery && ' (Query: ✅)'}
                    </p>
                    <p>
                      <strong>References Table:</strong> {dbTestResults.structure.references ? '✅' : '❌'}
                      {dbTestResults.operations?.referencesInsert && ' (Insert: ✅)'}
                      {dbTestResults.operations?.referencesQuery && ' (Query: ✅)'}
                    </p>
                    <p>
                      <strong>AI Chat History Table:</strong> {dbTestResults.structure.ai_chat_history ? '✅' : '❌'}
                      {dbTestResults.operations?.aiChatHistoryInsert && ' (Insert: ✅)'}
                      {dbTestResults.operations?.aiChatHistoryQuery && ' (Query: ✅)'}
                    </p>
                    <p className="mt-2 text-xs">See console for detailed information.</p>
                  </div>
                </div>
              )}
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
