
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Document } from '@/types/document.types';
import { transformSupabaseToDocument } from '@/utils/document.utils';

export const useDocumentRealtime = (
  userId: string | undefined,
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>
) => {
  useEffect(() => {
    if (!userId) return;

    const documentsSubscription = supabase
      .channel('documents-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'documents',
          filter: `user_id=eq.${userId}`
        }, 
        (payload) => {
          console.log('Realtime update received:', payload);
          
          // Handle different event types
          switch (payload.eventType) {
            case 'INSERT': {
              const newDoc = payload.new as any;
              const transformedDoc = transformSupabaseToDocument(newDoc);
              setDocuments(prev => [transformedDoc, ...prev]);
              break;
            }
            case 'UPDATE': {
              const updatedDoc = payload.new as any;
              setDocuments(prev => prev.map(doc => {
                if (doc.id === updatedDoc.id) {
                  return transformSupabaseToDocument(updatedDoc);
                }
                return doc;
              }));
              break;
            }
            case 'DELETE': {
              const deletedDoc = payload.old as any;
              setDocuments(prev => prev.filter(doc => doc.id !== deletedDoc.id));
              break;
            }
          }
        }
      ).subscribe();

    // Clean up subscription when component unmounts or user changes
    return () => {
      documentsSubscription.unsubscribe();
    };
  }, [userId, setDocuments]);
};
