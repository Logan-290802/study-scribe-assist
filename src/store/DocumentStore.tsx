
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
        console.log("Loading documents for user:", user.id);
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('user_id', user.id)
          .order('last_modified', { ascending: false });

        if (error) {
          console.error("Error loading documents:", error);
          throw error;
        }

        console.log("Documents loaded:", data);

        // Transform from Supabase format to our app format
        const transformedDocs: Document[] = data.map((doc: any) => ({
          id: doc.id,
          title: doc.title,
          moduleNumber: doc.moduleNumber,
          dueDate: doc.dueDate ? new Date(doc.dueDate) : undefined,
          lastModified: new Date(doc.last_modified), // Convert from snake_case to camelCase
          snippet: doc.snippet,
          referencesCount: doc.references_count || 0, // Convert from snake_case to camelCase with fallback
          content: doc.content,
        }));

        setDocuments(transformedDocs);
      } catch (error: any) {
        console.error("Document loading error:", error);
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

    // Set up realtime subscription
    const documentsSubscription = supabase
      .channel('documents-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'documents',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          console.log('Realtime update received:', payload);
          
          // Handle different event types
          switch (payload.eventType) {
            case 'INSERT': {
              const newDoc = payload.new as any;
              const transformedDoc: Document = {
                id: newDoc.id,
                title: newDoc.title,
                moduleNumber: newDoc.moduleNumber,
                dueDate: newDoc.dueDate ? new Date(newDoc.dueDate) : undefined,
                lastModified: new Date(newDoc.last_modified),
                snippet: newDoc.snippet,
                referencesCount: newDoc.references_count || 0,
                content: newDoc.content,
              };
              
              setDocuments(prev => [transformedDoc, ...prev]);
              break;
            }
            case 'UPDATE': {
              const updatedDoc = payload.new as any;
              setDocuments(prev => prev.map(doc => {
                if (doc.id === updatedDoc.id) {
                  return {
                    ...doc,
                    title: updatedDoc.title,
                    moduleNumber: updatedDoc.moduleNumber,
                    dueDate: updatedDoc.dueDate ? new Date(updatedDoc.dueDate) : undefined,
                    lastModified: new Date(updatedDoc.last_modified),
                    snippet: updatedDoc.snippet,
                    referencesCount: updatedDoc.references_count || 0,
                    content: updatedDoc.content,
                  };
                }
                return doc;
              }));
              break;
            }
            case 'DELETE': {
              const deletedDoc = payload.old as any;
              setDocuments(prev => prev.filter(doc => doc.id !== deletedDoc.id));
              break;
            }
          }
        }
      ).subscribe();

    // Clean up subscription when component unmounts or user changes
    return () => {
      documentsSubscription.unsubscribe();
    };
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
      console.log("Creating document:", document, "for user:", user.id);
      
      // Prepare document for Supabase
      const newDoc = {
        title: document.title,
        moduleNumber: document.moduleNumber,
        dueDate: document.dueDate?.toISOString(),
        last_modified: now, // Use snake_case for Supabase
        snippet: document.snippet,
        references_count: document.referencesCount, // Use snake_case for Supabase
        content: document.content || '',
        user_id: user.id,
      };
      
      console.log("Sending to Supabase:", newDoc);
      
      const { data, error } = await supabase
        .from('documents')
        .insert(newDoc)
        .select()
        .single();
      
      if (error) {
        console.error("Error creating document:", error);
        throw error;
      }
      
      console.log("Document created:", data);
      
      const addedDoc: Document = {
        id: data.id,
        title: data.title,
        moduleNumber: data.moduleNumber,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        lastModified: new Date(data.last_modified),
        snippet: data.snippet,
        referencesCount: data.references_count || 0,
        content: data.content,
      };
      
      setDocuments(prev => [addedDoc, ...prev]);
      return data.id;
    } catch (error: any) {
      console.error("Document creation error:", error);
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
      // Convert snake_case for Supabase
      const supabaseUpdates: any = {};
      
      if (updates.title !== undefined) supabaseUpdates.title = updates.title;
      if (updates.moduleNumber !== undefined) supabaseUpdates.moduleNumber = updates.moduleNumber;
      if (updates.dueDate !== undefined) supabaseUpdates.dueDate = updates.dueDate?.toISOString();
      if (updates.snippet !== undefined) supabaseUpdates.snippet = updates.snippet;
      if (updates.referencesCount !== undefined) supabaseUpdates.references_count = updates.referencesCount;
      if (updates.content !== undefined) supabaseUpdates.content = updates.content;
      
      // Always update last_modified
      supabaseUpdates.last_modified = new Date().toISOString();
      
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
