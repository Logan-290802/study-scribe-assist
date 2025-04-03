
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { handleFileUpload, checkStorageBucket, createStorageBucket } from './fileUtils';
import { convertFileToKnowledgeBaseItem } from '@/services/KnowledgeBaseService';
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
        
        // Check if storage bucket exists before attempting upload
        const bucketExists = await checkStorageBucket();
        if (!bucketExists) {
          try {
            // Attempt to create the bucket
            const created = await createStorageBucket();
            if (!created) {
              // Show a specific message about storage not being set up
              toast({
                title: "Storage Not Available",
                description: "The file storage system hasn't been configured. Please ask the administrator to set up Supabase storage.",
                variant: "destructive",
              });
              
              // Add error message to chat
              const errorMessage = createErrorMessage("I'm sorry, I couldn't process your file. The file storage system isn't available at the moment.");
              setMessages(prev => [...prev, errorMessage]);
              setIsLoading(false);
              return;
            }
          } catch (bucketError) {
            console.error('Error creating bucket:', bucketError);
            toast({
              title: "Storage Setup Failed",
              description: "Unable to set up file storage. You may need administrator permissions.",
              variant: "destructive",
            });
            
            const errorMessage = createErrorMessage("I'm sorry, I couldn't set up the file storage system. You may need administrator permissions.");
            setMessages(prev => [...prev, errorMessage]);
            setIsLoading(false);
            return;
          }
        }
        
        try {
          // Upload file to storage
          const { path, fileType } = await handleFileUpload(file, documentId, userId);
          
          // Add file to knowledge base if the callback is provided
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
          if (uploadError.message.includes('permission denied') || 
              uploadError.message.includes('Unauthorized') ||
              (uploadError.statusCode && uploadError.statusCode === 403)) {
            errorDescription = "You don't have permission to upload files. Please contact your administrator.";
          }
          
          toast({
            title: "Upload Error",
            description: errorDescription,
            variant: "destructive",
          });
          
          // Add error message to chat
          const errorMessage = createErrorMessage("I'm sorry, I couldn't process your file. " + errorDescription);
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
