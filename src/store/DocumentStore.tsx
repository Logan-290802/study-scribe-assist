
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, Document as SupabaseDocument } from '@/lib/supabase';
import { useAuth } from '@/store/AuthContext';
import { useToast } from '@/components/ui/use-toast';

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
  loading: boolean;
  addDocument: (document: Omit<Document, 'id' | 'lastModified'>) => Promise<string>;
  updateDocument: (id: string, updates: Partial<Omit<Document, 'id'>>) => Promise<void>;
  getDocument: (id: string) => Document | undefined;
  deleteDocument: (id: string) => Promise<void>;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider = ({ children }: { children: ReactNode }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load documents when user changes
  useEffect(() => {
    if (!user) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    async function loadDocuments() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('user_id', user.id)
          .order('last_modified', { ascending: false });

        if (error) {
          throw error;
        }

        // Transform from Supabase format to our app format
        const transformedDocs: Document[] = data.map((doc: SupabaseDocument) => ({
          id: doc.id,
          title: doc.title,
          moduleNumber: doc.moduleNumber,
          dueDate: doc.dueDate ? new Date(doc.dueDate) : undefined,
          lastModified: new Date(doc.lastModified),
          snippet: doc.snippet,
          referencesCount: doc.referencesCount,
          content: doc.content,
        }));

        setDocuments(transformedDocs);
      } catch (error: any) {
        toast({
          title: "Error loading documents",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadDocuments();
  }, [user, toast]);

  const addDocument = async (document: Omit<Document, 'id' | 'lastModified'>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a document",
        variant: "destructive",
      });
      throw new Error("Authentication required");
    }

    try {
      const now = new Date().toISOString();
      
      // Prepare document for Supabase
      const newDoc = {
        title: document.title,
        moduleNumber: document.moduleNumber,
        dueDate: document.dueDate?.toISOString(),
        lastModified: now,
        snippet: document.snippet,
        referencesCount: document.referencesCount,
        content: document.content || '',
        user_id: user.id,
      };
      
      const { data, error } = await supabase
        .from('documents')
        .insert(newDoc)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      const addedDoc: Document = {
        id: data.id,
        title: data.title,
        moduleNumber: data.moduleNumber,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        lastModified: new Date(data.lastModified),
        snippet: data.snippet,
        referencesCount: data.referencesCount,
        content: data.content,
      };
      
      setDocuments(prev => [addedDoc, ...prev]);
      return data.id;
    } catch (error: any) {
      toast({
        title: "Error creating document",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateDocument = async (id: string, updates: Partial<Omit<Document, 'id'>>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to update a document",
        variant: "destructive",
      });
      throw new Error("Authentication required");
    }

    try {
      // Prepare updates for Supabase
      const supabaseUpdates: any = {
        ...updates,
        lastModified: new Date().toISOString(),
        dueDate: updates.dueDate?.toISOString(),
      };
      
      const { error } = await supabase
        .from('documents')
        .update(supabaseUpdates)
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setDocuments(prev => prev.map(doc => {
        if (doc.id === id) {
          return {
            ...doc,
            ...updates,
            lastModified: new Date(),
          };
        }
        return doc;
      }));
    } catch (error: any) {
      toast({
        title: "Error updating document",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const getDocument = (id: string) => {
    return documents.find(doc => doc.id === id);
  };

  const deleteDocument = async (id: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to delete a document",
        variant: "destructive",
      });
      throw new Error("Authentication required");
    }

    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        throw error;
      }
      
      setDocuments(prev => prev.filter(doc => doc.id !== id));
    } catch (error: any) {
      toast({
        title: "Error deleting document",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

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
