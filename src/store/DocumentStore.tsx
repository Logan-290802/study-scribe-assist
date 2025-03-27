
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Document {
  id: string;
  title: string;
  moduleNumber?: string;
  dueDate?: Date;
  lastModified: Date;
  snippet: string;
  referencesCount: number;
  content?: string;
}

interface DocumentContextType {
  documents: Document[];
  addDocument: (document: Omit<Document, 'id' | 'lastModified'>) => string;
  getDocument: (id: string) => Document | undefined;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider = ({ children }: { children: ReactNode }) => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      title: 'Renewable Energy in Developing Countries',
      snippet: 'This paper explores the potential of renewable energy sources in developing countries, with a focus on solar and wind power implementations in rural areas.',
      lastModified: new Date('2023-05-15'),
      referencesCount: 12,
      content: 'Introduction to renewable energy in developing countries...'
    }
  ]);

  const addDocument = (document: Omit<Document, 'id' | 'lastModified'>) => {
    const id = (documents.length + 1).toString();
    const newDocument = {
      ...document,
      id,
      lastModified: new Date(),
    };
    
    setDocuments([...documents, newDocument]);
    return id;
  };

  const getDocument = (id: string) => {
    return documents.find(doc => doc.id === id);
  };

  return (
    <DocumentContext.Provider value={{ documents, addDocument, getDocument }}>
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
