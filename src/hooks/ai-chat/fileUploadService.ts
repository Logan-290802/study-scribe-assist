
import { supabase } from '@/lib/supabase';
import { ALLOWED_FILE_TYPES } from './fileUtils';
import { useToast } from '@/components/ui/use-toast';
import { convertFileToKnowledgeBaseItem } from '@/services/KnowledgeBaseService';

// Handles the core file upload process to Supabase storage
export const uploadFileToStorage = async (
  file: File,
  documentId: string,
  userId: string
): Promise<{ path: string; fileType: string }> => {
  const fileType = file.type;
  
  if (!Object.keys(ALLOWED_FILE_TYPES).includes(fileType)) {
    throw new Error(`Invalid file format. Allowed formats: PDF, JPEG, PNG, GIF, SVG.`);
  }
  
  const extension = ALLOWED_FILE_TYPES[fileType as keyof typeof ALLOWED_FILE_TYPES];
  const filePath = `${userId}/${Date.now()}_${file.name}`;
  
  console.log('Starting file upload process for:', file.name);
  console.log('User ID:', userId);
  console.log('Document ID:', documentId);
  
  try {
    console.log('Attempting to upload file to path:', filePath);
    
    // Attempt to upload the file
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (error) {
      console.error('Storage upload error:', error);
      
      // Handle specific error cases
      if (error.message.includes('The bucket specified does not exist') || 
          error.message.includes('bucket not found')) {
        throw new Error(`The 'uploads' bucket doesn't exist in your Supabase project. Please create it manually in the Supabase dashboard under Storage.`);
      }
      
      if (error.message.includes('row-level security policy') || 
          error.message.includes('Unauthorized') || 
          error.message.includes('403') ||
          error.message.includes('Permission denied')) {
        throw new Error(`Storage permission denied. Please check that:
        1. You are signed in
        2. Your 'allow_authenticated_uploads' policy allows authenticated users to upload to the 'uploads' bucket
        3. Your current policy is: ((bucket_id = 'uploads'::text) AND (auth.uid() IS NOT NULL))`);
      }
      
      if (error.message.includes('already exists')) {
        // Try with a different filename if there's a conflict
        const newFilePath = `${userId}/${Date.now()}_${Math.random().toString(36).substring(2)}_${file.name}`;
        console.log('Retrying with new file path:', newFilePath);
        
        const retryUpload = await supabase.storage
          .from('uploads')
          .upload(newFilePath, file, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (retryUpload.error) {
          console.error('Retry upload failed:', retryUpload.error);
          throw retryUpload.error;
        }
        
        console.log('Retry upload succeeded with path:', newFilePath);
        return { 
          path: newFilePath,
          fileType
        };
      }
      
      throw error;
    }
    
    console.log('File uploaded successfully:', data?.path);
    
    return { 
      path: filePath,
      fileType
    };
  } catch (error: any) {
    console.error('Error in file upload:', error);
    
    // Provide more specific guidance based on the error
    if (error.message.includes('bucket') || error.error_description?.includes('bucket')) {
      throw new Error(`Storage bucket issue: The 'uploads' bucket does not exist. Please create it in your Supabase dashboard under Storage.`);
    }
    
    if (error.message.includes('policy') || error.error_description?.includes('policy')) {
      throw new Error(`Storage policy issue: Your current uploads policy is ((bucket_id = 'uploads'::text) AND (auth.uid() IS NOT NULL)). Please make sure you're signed in.`);
    }
    
    throw error;
  }
};

// Adds a file to the knowledge base
export const addFileToKnowledgeBase = async (
  path: string, 
  fileType: string, 
  fileName: string, 
  userId: string,
  onAddToKnowledgeBase?: (item: any) => Promise<any>
) => {
  // Create the knowledge base item
  const knowledgeBaseItem = convertFileToKnowledgeBaseItem(path, fileType, fileName, userId);
  
  console.log('Adding to knowledge base:', fileName);
  console.log('Knowledge base item:', knowledgeBaseItem);
  
  if (onAddToKnowledgeBase) {
    try {
      console.log('Calling onAddToKnowledgeBase with:', knowledgeBaseItem);
      const result = await onAddToKnowledgeBase(knowledgeBaseItem);
      console.log('Knowledge base add result:', result);
      return result;
    } catch (error) {
      console.error('Error in addFileToKnowledgeBase:', error);
      console.error('Error details:', JSON.stringify(error));
      return null;
    }
  } else {
    console.warn('onAddToKnowledgeBase function not provided');
  }
  
  return null;
};
