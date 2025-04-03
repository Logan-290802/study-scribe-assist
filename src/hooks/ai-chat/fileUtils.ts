
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

// Allowed file types and their MIME types
export const ALLOWED_FILE_TYPES = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/svg+xml': 'svg'
};

export const handleFileUpload = async (
  file: File,
  documentId: string,
  userId: string
): Promise<{ path: string; fileType: string }> => {
  const fileType = file.type;
  
  if (!Object.keys(ALLOWED_FILE_TYPES).includes(fileType)) {
    throw new Error(`Invalid file format. Allowed formats: PDF, JPEG, PNG, GIF, SVG.`);
  }
  
  const extension = ALLOWED_FILE_TYPES[fileType as keyof typeof ALLOWED_FILE_TYPES];
  // Include user ID in the file path to help with permissions
  const filePath = `${userId}/${Date.now()}_${file.name}`;
  
  console.log('Starting file upload process for:', file.name);
  console.log('User ID:', userId);
  console.log('Document ID:', documentId);
  
  try {
    console.log('Attempting to upload file to path:', filePath);
    
    // Try the upload directly without checking bucket
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
        throw new Error(`Storage permission denied. Based on your current policies, make sure:
        1. "allow_authenticated_uploads" policy allows the current user to insert files
        2. Try setting the policy using this SQL in the Supabase dashboard:
           CREATE POLICY "Allow authenticated uploads" ON storage.objects
           FOR INSERT TO authenticated USING (auth.uid() = (storage.foldername(name))[1]);`);
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
      throw new Error(`Storage bucket issue: The 'uploads' bucket does not exist or is not properly configured. Please create it in your Supabase dashboard under Storage.`);
    }
    
    if (error.message.includes('policy') || error.error_description?.includes('policy')) {
      throw new Error(`Storage policy issue: Check that your RLS policies match your file structure. Your current path is "${userId}/[filename]" so ensure policies allow this pattern.`);
    }
    
    throw error;
  }
};

// Simplified check if bucket exists
export const checkStorageBucket = async (): Promise<'exists' | 'not-exists' | 'permission-denied' | 'error'> => {
  try {
    // Try to list files in the bucket instead of checking if it exists
    const { data, error } = await supabase.storage
      .from('uploads')
      .list();
    
    if (error) {
      console.error('Error checking uploads bucket:', error);
      
      if (error.message.includes('The bucket specified does not exist') || 
          error.message.includes('bucket not found')) {
        return 'not-exists';
      }
      
      if (error.message.includes('row-level security policy') || 
          error.message.includes('Unauthorized') || 
          error.message.includes('403') ||
          error.message.includes('Permission denied')) {
        return 'permission-denied';
      }
      
      return 'error';
    }
    
    return 'exists';
  } catch (error) {
    console.error('Error checking storage bucket:', error);
    return 'error';
  }
};

// This function is kept for compatibility but no longer tries to create a bucket
// since it requires admin privileges that most users won't have
export const createStorageBucket = async (): Promise<boolean> => {
  console.warn('Automatic bucket creation is not supported - please create the uploads bucket manually in Supabase dashboard');
  return false;
};
