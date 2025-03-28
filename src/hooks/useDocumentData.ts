
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDocuments } from '@/store/DocumentStore';
import { useAuth } from '@/store/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { Reference } from '@/components/ai/AiChat';

export const useDocumentData = () => {
  const { id } = useParams<{ id: string }>();
  const { getDocument, updateDocument } = useDocuments();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const document = id ? getDocument(id) : undefined;
  
  const [documentTitle, setDocumentTitle] = useState(document?.title || 'Untitled Document');
  const [documentContent, setDocumentContent] = useState(document?.content || '');
  const [references, setReferences] = useState<Reference[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // Initialize from document data
  useEffect(() => {
    if (document) {
      setDocumentTitle(document.title);
      setDocumentContent(document.content || '');
    }
  }, [document]);
  
  // Load references from Supabase
  useEffect(() => {
    if (!id || !user) return;

    const fetchReferences = async () => {
      try {
        const { data, error } = await supabase
          .from('references')
          .select('*')
          .eq('document_id', id)
          .eq('user_id', user.id);
        
        if (error) {
          throw error;
        }
        
        if (data) {
          const transformedRefs: Reference[] = data.map(ref => ({
            id: ref.id,
            title: ref.title,
            authors: ref.authors,
            year: ref.year,
            source: ref.source,
            url: ref.url,
            format: ref.format,
            content: ref.content,
          }));
          
          setReferences(transformedRefs);
        }
      } catch (error) {
        console.error('Error fetching references:', error);
      }
    };

    fetchReferences();
  }, [id, user]);
  
  // Save document
  const handleSave = async () => {
    if (!id || !user) return;
    
    try {
      setIsSaving(true);
      
      await updateDocument(id, {
        title: documentTitle,
        content: documentContent,
        snippet: documentContent.substring(0, 150) + '...',
      });
      
      toast({
        title: "Document saved",
        description: "Your document has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving document:', error);
      toast({
        title: "Error saving document",
        description: "There was an error saving your document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return {
    id,
    user,
    document,
    documentTitle,
    setDocumentTitle,
    documentContent,
    setDocumentContent,
    references,
    setReferences,
    isSaving,
    handleSave
  };
};
