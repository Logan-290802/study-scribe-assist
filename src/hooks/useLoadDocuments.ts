
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Document } from '@/types/document.types';
import { transformSupabaseToDocument } from '@/utils/document.utils';
import { useToast } from '@/components/ui/use-toast';

export const useLoadDocuments = (userId: string | undefined) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    async function loadDocuments() {
      try {
        setLoading(true);
        console.log("Loading documents for user:", userId);
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('user_id', userId)
          .order('last_modified', { ascending: false });

        if (error) {
          console.error("Error loading documents:", error);
          throw error;
        }

        console.log("Documents loaded:", data);

        // Transform from Supabase format to our app format
        const transformedDocs: Document[] = data.map(transformSupabaseToDocument);

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
  }, [userId, toast]);

  return { documents, setDocuments, loading };
};
