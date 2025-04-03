
import { useEffect, useState, useRef } from 'react';
import { useAutosave } from './useAutosave';
import { useDocuments } from '@/store/DocumentStore';
import { useToast } from '@/components/ui/use-toast';
import { saveChatMessageToDb } from '@/utils/chat/chatDatabaseUtils';

export interface DocumentData {
  title: string;
  content: string;
  chatHistory: { role: 'user' | 'assistant'; content: string }[];
}

export function useDocumentAutosave(
  documentId: string | undefined,
  userId: string | undefined,
  documentData: DocumentData
) {
  const { updateDocument } = useDocuments();
  const { toast } = useToast();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const previousDataRef = useRef<DocumentData | null>(null);
  
  // Check if data has actually changed
  const hasDataChanged = () => {
    if (!previousDataRef.current) return true;
    
    return (
      previousDataRef.current.title !== documentData.title ||
      previousDataRef.current.content !== documentData.content
    );
  };
  
  // Function to save the document content
  const saveDocument = async (data: DocumentData) => {
    if (!documentId || !userId) return;
    
    console.log('Saving document with ID:', documentId);
    console.log('Document content length:', data.content.length);
    
    try {
      // Save document content and title
      await updateDocument(documentId, {
        title: data.title,
        content: data.content,
        snippet: data.content?.substring(0, 150) || ''
      });
      
      // Save any new chat messages
      const latestChatMessage = data.chatHistory[data.chatHistory.length - 1];
      if (latestChatMessage) {
        await saveChatMessageToDb(
          documentId,
          userId,
          latestChatMessage.role,
          latestChatMessage.content
        );
      }
      
      // Update the previous data ref
      previousDataRef.current = { ...data };
      
      setLastSaved(new Date());
      console.log('Document saved successfully at', new Date().toISOString());
      return true;
    } catch (error) {
      console.error('Error saving document:', error);
      return false;
    }
  };
  
  // Setup autosave
  const autosave = useAutosave(
    documentData,
    saveDocument,
    [documentId, userId],
    {
      debounceTime: 2000,
      onSaveStart: () => {
        console.log('Starting autosave...');
        setIsSaving(true);
      },
      onSaveEnd: (success) => {
        console.log('Autosave completed with success:', success);
        setIsSaving(false);
        if (success) {
          setLastSaved(new Date());
        }
      }
    }
  );
  
  // Ensure initial save happens once
  useEffect(() => {
    if (documentId && userId && !previousDataRef.current && documentData) {
      console.log('Initial document data setup');
      previousDataRef.current = { ...documentData };
    }
  }, [documentId, userId, documentData]);
  
  // Manual save function
  const saveDocumentNow = async () => {
    try {
      console.log('Manual save triggered');
      setIsSaving(true);
      
      const success = await saveDocument(documentData);
      
      setIsSaving(false);
      
      if (success) {
        setLastSaved(new Date());
        
        toast({
          title: "Document Saved",
          description: "Your document has been saved successfully."
        });
      } else {
        throw new Error('Save operation failed');
      }
    } catch (error) {
      console.error('Error saving document:', error);
      setIsSaving(false);
      
      toast({
        title: "Save Failed",
        description: "Failed to save your document. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return {
    isSaving,
    lastSaved,
    saveNow: saveDocumentNow
  };
}
