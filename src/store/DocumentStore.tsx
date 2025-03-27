
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/store/AuthContext';
import { Document, DocumentContextType } from '@/types/document.types';
import { useLoadDocuments } from '@/hooks/useLoadDocuments';
import { useDocumentOperations } from '@/hooks/useDocumentOperations';
import { useDocumentRealtime } from '@/hooks/useDocumentRealtime';

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { documents, setDocuments, loading } = useLoadDocuments(user?.id);
  const { addDocument, updateDocument, getDocument, deleteDocument } = useDocumentOperations(
    user?.id, 
    documents, 
    setDocuments
  );
  
  // Set up realtime subscription
  useDocumentRealtime(user?.id, setDocuments);

  return (
    <DocumentContext.Provider value={{ 
      documents, 
      loading, 
      addDocument, 
      updateDocument, 
      getDocument, 
      deleteDocument 
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
