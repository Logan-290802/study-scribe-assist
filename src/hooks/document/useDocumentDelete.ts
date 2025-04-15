
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Document } from '@/types/document.types';
import { useToast } from '@/hooks/use-toast';

export const useDocumentDelete = (
  userId: string | undefined,
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>
) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

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
      setIsDeleting(true);
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
      setIsDeleting(false);
    }
  };

  return { deleteDocument, isDeleting };
};
