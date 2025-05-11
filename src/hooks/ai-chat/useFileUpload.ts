
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { checkStorageBucket } from './fileUtils';
import { uploadFileToStorage, addFileToKnowledgeBase } from './fileUploadService';
import { createFileUploadMessages } from './fileUploadMessages';
import { isClaudeCompatibleFile } from '@/utils/file-processing';

interface UseFileUploadProps {
  documentId?: string;
  userId?: string;
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  onAddToKnowledgeBase?: (item: any) => Promise<any>;
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
      setIsLoading(true);
      
      // Create and handle file upload messages
      const { userMessage, getErrorMessage, addProcessingAndAnalysisMessages } = 
        await createFileUploadMessages(file, documentId, userId, setMessages, setIsLoading);
      
      // Check if file is compatible with Claude
      if (!isClaudeCompatibleFile(file)) {
        console.log('File type not compatible with Claude analysis:', file.type);
        toast({
          title: "Unsupported File Type",
          description: `Claude can only analyze PDFs and images. This file type (${file.type}) is not supported for analysis.`,
          variant: "warning",
        });
      }
      
      // Add user message to chat
      setMessages(prev => [...prev, userMessage]);
      
      // If document and user IDs are available, proceed with storage and knowledge base
      if (userId && documentId) {
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
          const { path, fileType } = await uploadFileToStorage(file, documentId, userId);
          console.log('File uploaded successfully, path:', path);
          
          // Add file to knowledge base
          await addFileToKnowledgeBase(path, fileType, file.name, userId, onAddToKnowledgeBase);
          
          // Show success toast
          toast({
            title: "File uploaded",
            description: `"${file.name}" has been uploaded and added to your knowledge base.`,
          });
          
          // Now process with Claude and add the analysis
          await addProcessingAndAnalysisMessages();
          
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
          getErrorMessage(errorDescription, actionNeeded);
          return;
        }
      } else {
        // If no document/user ID, just analyze the file with Claude
        // without saving to storage or knowledge base
        await addProcessingAndAnalysisMessages();
      }
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
