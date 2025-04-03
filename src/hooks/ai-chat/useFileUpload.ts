
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { handleFileUpload, checkStorageBucket } from './fileUtils';
import { convertFileToKnowledgeBaseItem, addKnowledgeBaseItem } from '@/services/KnowledgeBaseService';
import { 
  createUserMessage, 
  createProcessingPdfMessage, 
  createProcessingImageMessage,
  createPdfAnalysisResponse,
  createImageAnalysisResponse,
  createErrorMessage,
  saveChatMessageToSupabase
} from './messageUtils';

interface UseFileUploadProps {
  documentId?: string;
  userId?: string;
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  onAddToKnowledgeBase?: (filePath: string, fileType: string, fileName: string) => Promise<void>;
}

export const useFileUpload = ({
  documentId,
  userId,
  setMessages,
  setIsLoading,
  onAddToKnowledgeBase
}: UseFileUploadProps) => {
  const { toast } = useToast();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileChange = async (file: File) => {
    try {
      setUploadedFile(file);
      
      const userMessage = createUserMessage(`I've uploaded a file: "${file.name}". Can you analyze it for me?`);
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      
      // First add the user message to chat history if applicable
      if (userId && documentId) {
        try {
          await saveChatMessageToSupabase({
            role: 'user',
            content: userMessage.content,
            document_id: documentId,
            user_id: userId,
          }, (error) => {
            console.error('Error saving chat message:', error);
          });
        } catch (error) {
          console.error('Error saving chat message:', error);
        }
        
        try {
          // Check if bucket exists first
          const bucketStatus = await checkStorageBucket();
          console.log('Bucket status:', bucketStatus);
          
          if (bucketStatus === 'not-exists') {
            throw new Error("The 'uploads' bucket doesn't exist. Please create it in your Supabase dashboard under Storage.");
          }
          
          if (bucketStatus === 'permission-denied') {
            console.log('Permission issue detected. Will attempt upload anyway in case it works with the current policy.');
          }
          
          // Upload file to storage
          const { path, fileType } = await handleFileUpload(file, documentId, userId);
          
          // Add file directly to knowledge base
          if (userId) {
            const knowledgeBaseItem = convertFileToKnowledgeBaseItem(path, fileType, file.name, userId);
            await addKnowledgeBaseItem(knowledgeBaseItem);
            
            toast({
              title: "File added to knowledge base",
              description: `"${file.name}" has been added to your knowledge base.`,
            });
          }
          
          // Also call the original onAddToKnowledgeBase for backward compatibility
          if (onAddToKnowledgeBase) {
            try {
              await onAddToKnowledgeBase(path, fileType, file.name);
            } catch (knowledgeBaseError) {
              console.error('Error adding to knowledge base:', knowledgeBaseError);
              // Continue with chat even if knowledge base fails
            }
          }
        } catch (uploadError: any) {
          console.error('Error uploading file:', uploadError);
          
          let errorDescription = "Failed to upload file to storage. Please try again later.";
          let actionNeeded = "";
          
          if (uploadError.message.includes('bucket') || 
              (typeof uploadError === 'object' && uploadError.error_description?.includes('bucket'))) {
            errorDescription = "The 'uploads' bucket doesn't exist in your Supabase project.";
            actionNeeded = "Please create it manually in the Supabase dashboard under Storage.";
          } else if (uploadError.message.includes('row-level security policy') || 
                  uploadError.message.includes('Unauthorized') ||
                  uploadError.message.includes('Permission denied')) {
            errorDescription = "Permission issue with Supabase Storage.";
            actionNeeded = "Please check that you're signed in and your Supabase policy allows authenticated uploads.";
          }
          
          toast({
            title: "Upload Error",
            description: `${errorDescription} ${actionNeeded}`,
            variant: "destructive",
          });
          
          // Add error message to chat
          const errorMessage = createErrorMessage(`I'm sorry, I couldn't process your file. ${errorDescription} ${actionNeeded}`);
          setMessages(prev => [...prev, errorMessage]);
          setIsLoading(false);
          return;
        }
      }
      
      // Processing message after short delay
      setTimeout(() => {
        const isImage = file.type.startsWith('image/');
        const processingMessage = isImage 
          ? createProcessingImageMessage(file.name)
          : createProcessingPdfMessage(file.name);
        
        setMessages((prev) => [...prev, processingMessage]);
        
        if (userId && documentId) {
          try {
            saveChatMessageToSupabase({
              role: 'assistant',
              content: processingMessage.content,
              document_id: documentId,
              user_id: userId,
            }, (error) => {
              console.error('Error saving processing message:', error);
            });
          } catch (error) {
            console.error('Error saving processing message:', error);
          }
        }
        
        // Analysis message after longer delay
        setTimeout(() => {
          const isImage = file.type.startsWith('image/');
          const analysisMessage = isImage
            ? createImageAnalysisResponse(file.name)
            : createPdfAnalysisResponse(file.name);
            
          setMessages((prev) => [...prev, analysisMessage]);
          setIsLoading(false);
          
          if (userId && documentId) {
            try {
              saveChatMessageToSupabase({
                role: 'assistant',
                content: analysisMessage.content,
                document_id: documentId,
                user_id: userId,
              }, (error) => {
                console.error('Error saving analysis message:', error);
              });
            } catch (error) {
              console.error('Error saving analysis message:', error);
            }
          }
        }, 2000);
      }, 1500);
    } catch (error) {
      console.error('Error handling file:', error);
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to process the file",
        variant: "destructive",
      });
    }
  };

  return {
    uploadedFile,
    setUploadedFile,
    handleFileChange
  };
};
