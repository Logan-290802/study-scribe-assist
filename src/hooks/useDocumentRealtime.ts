import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Document } from '@/types/document.types';
import { transformSupabaseToDocument } from '@/utils/document.utils';

export const useDocumentRealtime = (
  userId: string | undefined,
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>
) => {
  // Keep track of recently added document IDs to prevent duplication
  const recentlyAddedIds = useRef(new Set<string>());
  
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
              
              // Check if this document was recently added manually to prevent duplication
              if (recentlyAddedIds.current.has(newDoc.id)) {
                console.log('Ignoring duplicate insertion from realtime for document:', newDoc.id);
                // Remove from tracking after handling
                recentlyAddedIds.current.delete(newDoc.id);
                return;
              }
              
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
  
  // Helper function to track newly added document IDs
  const trackNewDocumentId = (id: string) => {
    recentlyAddedIds.current.add(id);
    // Auto-remove after 5 seconds to prevent memory leaks
    setTimeout(() => {
      recentlyAddedIds.current.delete(id);
    }, 5000);
  };
  
  return { trackNewDocumentId };
};
