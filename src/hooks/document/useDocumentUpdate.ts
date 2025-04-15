
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Document } from '@/types/document.types';
import { useToast } from '@/hooks/use-toast';
import { prepareDocumentUpdate } from '@/utils/document.utils';

export const useDocumentUpdate = (
  userId: string | undefined,
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>
) => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

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
      setIsUpdating(true);
      const supabaseUpdates = prepareDocumentUpdate(updates);
      
      const { error } = await supabase
        .from('documents')
        .update(supabaseUpdates)
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) {
        throw error;
      }
      
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
      setIsUpdating(false);
    }
  };

  return { updateDocument, isUpdating };
};
