
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/store/AuthContext';
import { Document, DocumentContextType } from '@/types/document.types';
import { useLoadDocuments } from '@/hooks/useLoadDocuments';
import { useDocumentOperations } from '@/hooks/useDocumentOperations';
import { useDocumentRealtime } from '@/hooks/useDocumentRealtime';
import { useKnowledgeBase } from '@/hooks/useKnowledgeBase';
import { KnowledgeBaseItem } from '@/services/KnowledgeBaseService';

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { documents, setDocuments, loading } = useLoadDocuments(user?.id);
  
  // Set up realtime subscription and get tracking function
  const { trackNewDocumentId } = useDocumentRealtime(user?.id, setDocuments);
  
  const { 
    addDocument, 
    updateDocument, 
    getDocument, 
    deleteDocument, 
    archiveDocument 
  } = useDocumentOperations(
    user?.id, 
    documents, 
    setDocuments,
    trackNewDocumentId // Pass the tracking function to prevent duplicates
  );

  // Add Knowledge Base functionality
  const { knowledgeBaseItems, isLoading: kbLoading, addItem, deleteItem } = useKnowledgeBase(user?.id);

  return (
    <DocumentContext.Provider value={{ 
      documents, 
      loading, 
      addDocument, 
      updateDocument, 
      getDocument, 
      deleteDocument,
      archiveDocument,
      // Knowledge base properties
      knowledgeBaseItems,
      knowledgeBaseLoading: kbLoading,
      addKnowledgeBaseItem: addItem,
      deleteKnowledgeBaseItem: deleteItem
    }}>
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};
