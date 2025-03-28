
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { Reference } from '@/components/ai/AiChat';

export const useReferenceManagement = (
  documentId: string | undefined, 
  userId: string | undefined,
  references: Reference[],
  setReferences: React.Dispatch<React.SetStateAction<Reference[]>>,
  updateDocument: (id: string, updates: any) => Promise<void>
) => {
  const { toast } = useToast();
  
  const handleAddReference = async (reference: Reference) => {
    if (!documentId || !userId) return;
    
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
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      const newReference: Reference = {
        id: data.id,
        title: data.title,
        authors: data.authors,
        year: data.year,
        source: data.source,
        url: data.url,
        format: data.format as 'APA' | 'MLA' | 'Harvard',
        content: data.content,
      };
      
      setReferences([...references, newReference]);
      
      await updateDocument(documentId, {
        referencesCount: references.length + 1,
      });
      
      toast({
        title: "Reference added",
        description: `${reference.title} has been added to your references.`,
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
    if (!documentId || !userId) return;
    
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
