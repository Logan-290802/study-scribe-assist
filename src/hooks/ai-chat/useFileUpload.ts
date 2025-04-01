
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { handleFileUpload } from './fileUtils';
import { 
  createUserMessage, 
  createProcessingPdfMessage, 
  createProcessingImageMessage,
  createPdfAnalysisResponse,
  createImageAnalysisResponse,
  saveChatMessageToSupabase
} from './messageUtils';

interface UseFileUploadProps {
  documentId?: string;
  userId?: string;
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useFileUpload = ({
  documentId,
  userId,
  setMessages,
  setIsLoading
}: UseFileUploadProps) => {
  const { toast } = useToast();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileChange = async (file: File) => {
    try {
      setUploadedFile(file);
      
      const userMessage = createUserMessage(`I've uploaded a file: "${file.name}". Can you analyze it for me?`);
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      
      if (userId && documentId) {
        await saveChatMessageToSupabase({
          role: 'user',
          content: userMessage.content,
          document_id: documentId,
          user_id: userId,
        }, (error) => {
          toast({
            title: "Error",
            description: "Failed to save chat message",
            variant: "destructive",
          });
        });
        
        try {
          await handleFileUpload(file, documentId, userId);
        } catch (error) {
          console.error('Error uploading file:', error);
          toast({
            title: "Upload Error",
            description: "Failed to upload file to storage",
            variant: "destructive",
          });
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
          saveChatMessageToSupabase({
            role: 'assistant',
            content: processingMessage.content,
            document_id: documentId,
            user_id: userId,
          }, (error) => {
            toast({
              title: "Error",
              description: "Failed to save chat message",
              variant: "destructive",
            });
          });
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
            saveChatMessageToSupabase({
              role: 'assistant',
              content: analysisMessage.content,
              document_id: documentId,
              user_id: userId,
            }, (error) => {
              toast({
                title: "Error",
                description: "Failed to save chat message",
                variant: "destructive",
              });
            });
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
