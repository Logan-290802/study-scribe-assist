
import { useEffect, useState } from 'react';
import { useAutosave } from './useAutosave';
import { useDocuments } from '@/store/DocumentStore';
import { Document } from '@/types/document.types';
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
  
  // Function to save the document content
  const saveDocument = async (data: DocumentData) => {
    if (!documentId || !userId) return;
    
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
    
    setLastSaved(new Date());
  };
  
  // Setup autosave
  const autosave = useAutosave(
    documentData,
    saveDocument,
    [documentId, userId],
    {
      debounceTime: 2000,
      onSaveStart: () => setIsSaving(true),
      onSaveEnd: (success) => {
        setIsSaving(false);
        if (success) {
          setLastSaved(new Date());
        }
      }
    }
  );
  
  // Manual save function
  const saveDocumentNow = async () => {
    try {
      setIsSaving(true);
      await saveDocument(documentData);
      setIsSaving(false);
      setLastSaved(new Date());
      
      toast({
        title: "Document Saved",
        description: "Your document has been saved successfully."
      });
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
