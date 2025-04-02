
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { KnowledgeBaseReference } from '@/types/knowledgeBase.types';
import { useToast } from '@/components/ui/use-toast';

export const useKnowledgeBase = (userId: string | undefined) => {
  const [references, setReferences] = useState<KnowledgeBaseReference[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchReferences = async () => {
    if (!userId) {
      setReferences([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('knowledge_base_references')
        .select('*')
        .eq('user_id', userId)
        .order('date_added', { ascending: false });

      if (error) {
        console.error("Error loading knowledge base references:", error);
        throw error;
      }

      const transformedRefs: KnowledgeBaseReference[] = data.map(ref => ({
        id: ref.id,
        title: ref.title,
        authors: ref.authors,
        year: ref.year,
        type: ref.type,
        summary: ref.summary || '',
        tags: ref.tags || [],
        has_pdf: ref.has_pdf,
        discipline: ref.discipline || '',
        usage_count: ref.usage_count,
        date_added: new Date(ref.date_added),
        is_favorite: ref.is_favorite,
        user_id: ref.user_id,
        document_id: ref.document_id,
        pdf_path: ref.pdf_path,
        source_url: ref.source_url,
        citation_format: ref.citation_format
      }));

      setReferences(transformedRefs);
    } catch (error: any) {
      console.error("Reference loading error:", error);
      toast({
        title: "Error loading references",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addReference = async (reference: Omit<KnowledgeBaseReference, 'id' | 'date_added' | 'usage_count'>) => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add references",
        variant: "destructive",
      });
      throw new Error("Authentication required");
    }

    try {
      const newRef = {
        ...reference,
        user_id: userId,
        usage_count: 0
      };
      
      const { data, error } = await supabase
        .from('knowledge_base_references')
        .insert(newRef)
        .select()
        .single();
      
      if (error) {
        console.error("Error adding reference:", error);
        throw error;
      }
      
      const addedRef: KnowledgeBaseReference = {
        id: data.id,
        title: data.title,
        authors: data.authors,
        year: data.year,
        type: data.type,
        summary: data.summary || '',
        tags: data.tags || [],
        has_pdf: data.has_pdf,
        discipline: data.discipline || '',
        usage_count: data.usage_count,
        date_added: new Date(data.date_added),
        is_favorite: data.is_favorite,
        user_id: data.user_id,
        document_id: data.document_id,
        pdf_path: data.pdf_path,
        source_url: data.source_url,
        citation_format: data.citation_format
      };
      
      setReferences(prev => [addedRef, ...prev]);
      return data.id;
    } catch (error: any) {
      console.error("Reference creation error:", error);
      toast({
        title: "Error adding reference",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateReference = async (id: string, updates: Partial<Omit<KnowledgeBaseReference, 'id'>>) => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to update references",
        variant: "destructive",
      });
      throw new Error("Authentication required");
    }

    try {
      const { error } = await supabase
        .from('knowledge_base_references')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setReferences(prev => prev.map(ref => {
        if (ref.id === id) {
          return {
            ...ref,
            ...updates,
          };
        }
        return ref;
      }));
    } catch (error: any) {
      toast({
        title: "Error updating reference",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteReference = async (id: string) => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to delete references",
        variant: "destructive",
      });
      throw new Error("Authentication required");
    }

    try {
      const { error } = await supabase
        .from('knowledge_base_references')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) {
        throw error;
      }
      
      setReferences(prev => prev.filter(ref => ref.id !== id));
      
      toast({
        title: "Reference deleted",
        description: "The reference has been permanently deleted."
      });
    } catch (error: any) {
      toast({
        title: "Error deleting reference",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const toggleFavorite = async (id: string) => {
    const reference = references.find(ref => ref.id === id);
    if (!reference) return;
    
    const newIsFavorite = !reference.is_favorite;
    
    try {
      await updateReference(id, { is_favorite: newIsFavorite });
      
      toast({
        title: newIsFavorite ? "Added to favorites" : "Removed from favorites",
        description: `"${reference.title}" has been ${newIsFavorite ? "added to" : "removed from"} your favorites.`
      });
    } catch (error) {
      console.error("Error toggling favorite status:", error);
    }
  };

  return {
    references,
    loading,
    fetchReferences,
    addReference,
    updateReference,
    deleteReference,
    toggleFavorite
  };
};
