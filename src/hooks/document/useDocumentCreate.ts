
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Document } from '@/types/document.types';
import { useToast } from '@/hooks/use-toast';
import { transformSupabaseToDocument, transformDocumentToSupabase } from '@/utils/document.utils';

export const useDocumentCreate = (
  userId: string | undefined,
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>,
  trackNewDocumentId?: (id: string) => void
) => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

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
      setIsCreating(true);
      console.log("Creating document:", document, "for user:", userId);
      
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
      
      if (trackNewDocumentId) {
        trackNewDocumentId(data.id);
      }
      
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
      setIsCreating(false);
    }
  };

  return { addDocument, isCreating };
};
