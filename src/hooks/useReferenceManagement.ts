
import { useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { Reference } from '@/components/ai';
import { Document } from '@/types/document.types';
import { useDocuments } from '@/store/DocumentStore';
import { convertReferenceToKnowledgeBaseItem } from '@/services/KnowledgeBaseService';

export const useReferenceManagement = (
  documentId: string | undefined, 
  userId: string | undefined,
  references: Reference[],
  setReferences: React.Dispatch<React.SetStateAction<Reference[]>>,
  updateDocument: (id: string, updates: Partial<Omit<Document, 'id'>>) => Promise<void>
) => {
  const { toast } = useToast();
  const { addKnowledgeBaseItem } = useDocuments();
  
  useEffect(() => {
    if (!documentId) {
      setReferences([]);
    }
  }, [documentId, setReferences]);
  
  const handleAddReference = async (reference: Reference) => {
    if (!documentId || !userId) {
      toast({
        title: "Cannot add reference",
        description: "Document must be saved before adding references.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('references')
        .insert({
          title: reference.title,
          authors: reference.authors,
          year: reference.year,
          source: reference.source,
          url: reference.url,
          format: reference.format,
          content: reference.content,
          document_id: documentId,
          user_id: userId,
          file_path: reference.file_path
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const newReference: Reference = {
        id: data.id,
        title: data.title,
        authors: data.authors,
        year: data.year,
        source: data.source,
        url: data.url,
        format: data.format as 'APA' | 'MLA' | 'Harvard',
        content: data.content,
        file_path: data.file_path
      };
      
      setReferences([...references, newReference]);
      
      // Add to knowledge base with improved logging
      if (addKnowledgeBaseItem) {
        console.log('Creating knowledge base item from reference:', newReference);
        const knowledgeBaseItem = convertReferenceToKnowledgeBaseItem(newReference, userId);
        console.log('Knowledge base item created:', knowledgeBaseItem);
        try {
          const result = await addKnowledgeBaseItem(knowledgeBaseItem);
          console.log('Knowledge base item added, result:', result);
        } catch (kbError) {
          console.error('Error adding to knowledge base:', kbError);
        }
      } else {
        console.warn('addKnowledgeBaseItem function is not available');
      }
      
      await updateDocument(documentId, {
        referencesCount: references.length + 1,
      });
      
      toast({
        title: "Reference added",
        description: `${reference.title} has been added to your references and knowledge base.`,
      });
    } catch (error) {
      console.error('Error adding reference:', error);
      toast({
        title: "Error adding reference",
        description: "There was an error adding the reference. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteReference = async (referenceId: string) => {
    if (!documentId || !userId) {
      toast({
        title: "Cannot delete reference",
        description: "Document must be saved before managing references.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('references')
        .delete()
        .eq('id', referenceId)
        .eq('user_id', userId);
      
      if (error) {
        throw error;
      }
      
      setReferences(references.filter(ref => ref.id !== referenceId));
      
      await updateDocument(documentId, {
        referencesCount: references.length - 1,
      });
      
      toast({
        title: "Reference removed",
        description: "The reference has been removed from your document.",
      });
    } catch (error) {
      console.error('Error deleting reference:', error);
      toast({
        title: "Error removing reference",
        description: "There was an error removing the reference. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    handleAddReference,
    handleDeleteReference
  };
};
