
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Document } from '@/types/document.types';
import { useToast } from '@/hooks/use-toast';

export const useDocumentArchive = (
  userId: string | undefined,
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>
) => {
  const { toast } = useToast();
  const [isArchiving, setIsArchiving] = useState(false);

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
      setIsArchiving(true);
      
      const { error } = await supabase
        .from('documents')
        .update({ archived })
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) {
        throw error;
      }
      
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
      setIsArchiving(false);
    }
  };

  return { archiveDocument, isArchiving };
};
