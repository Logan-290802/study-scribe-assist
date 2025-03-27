
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Document } from '@/types/document.types';
import { useToast } from '@/components/ui/use-toast';
import { 
  transformSupabaseToDocument, 
  transformDocumentToSupabase,
  prepareDocumentUpdate
} from '@/utils/document.utils';

export const useDocumentOperations = (
  userId: string | undefined,
  documents: Document[],
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>
) => {
  const { toast } = useToast();
  const [isOperationInProgress, setIsOperationInProgress] = useState(false);

  const addDocument = async (document: Omit<Document, 'id' | 'lastModified'>) => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a document",
        variant: "destructive",
      });
      throw new Error("Authentication required");
    }

    try {
      setIsOperationInProgress(true);
      console.log("Creating document:", document, "for user:", userId);
      
      // Prepare document for Supabase
      const newDoc = transformDocumentToSupabase(document, userId);
      
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
      
      const addedDoc = transformSupabaseToDocument(data);
      
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
    } finally {
      setIsOperationInProgress(false);
    }
  };

  const updateDocument = async (id: string, updates: Partial<Omit<Document, 'id'>>) => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to update a document",
        variant: "destructive",
      });
      throw new Error("Authentication required");
    }

    try {
      setIsOperationInProgress(true);
      // Convert snake_case for Supabase
      const supabaseUpdates = prepareDocumentUpdate(updates);
      
      const { error } = await supabase
        .from('documents')
        .update(supabaseUpdates)
        .eq('id', id)
        .eq('user_id', userId);
      
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
    } finally {
      setIsOperationInProgress(false);
    }
  };

  const getDocument = (id: string) => {
    return documents.find(doc => doc.id === id);
  };

  const deleteDocument = async (id: string) => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to delete a document",
        variant: "destructive",
      });
      throw new Error("Authentication required");
    }

    try {
      setIsOperationInProgress(true);
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) {
        throw error;
      }
      
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      
      toast({
        title: "Document deleted",
        description: "The document has been permanently deleted."
      });
    } catch (error: any) {
      toast({
        title: "Error deleting document",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsOperationInProgress(false);
    }
  };
  
  const archiveDocument = async (id: string, archived: boolean) => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to archive a document",
        variant: "destructive",
      });
      throw new Error("Authentication required");
    }

    try {
      setIsOperationInProgress(true);
      
      const { error } = await supabase
        .from('documents')
        .update({ archived })
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setDocuments(prev => prev.map(doc => {
        if (doc.id === id) {
          return {
            ...doc,
            archived,
            lastModified: new Date(),
          };
        }
        return doc;
      }));
      
      toast({
        title: archived ? "Document archived" : "Document restored",
        description: archived 
          ? "The document has been moved to the archive." 
          : "The document has been restored from the archive."
      });
    } catch (error: any) {
      toast({
        title: archived ? "Error archiving document" : "Error restoring document",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsOperationInProgress(false);
    }
  };

  return {
    addDocument,
    updateDocument,
    getDocument,
    deleteDocument,
    archiveDocument,
    isOperationInProgress
  };
};
