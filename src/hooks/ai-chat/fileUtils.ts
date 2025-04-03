
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
  
  // First check if the bucket exists
  const bucketStatus = await checkStorageBucket();
  
  if (bucketStatus === 'not-exists') {
    console.log('Uploads bucket does not exist, attempting to create it...');
    const created = await createStorageBucket();
    if (!created) {
      console.error('Failed to create uploads bucket');
      throw new Error('Failed to create storage bucket. Please contact administrator.');
    }
    console.log('Successfully created uploads bucket');
  } else if (bucketStatus === 'permission-denied') {
    console.log('Permission denied while checking bucket. User may not have admin rights.');
    // Instead of failing, we'll try to upload anyway - maybe the bucket exists and user just can't list buckets
  } else if (bucketStatus === 'exists') {
    console.log('Uploads bucket already exists');
  } else {
    console.log('Unknown bucket status, attempting upload anyway');
  }
  
  try {
    console.log('Attempting to upload file to path:', filePath);
    
    // Now try the upload
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (error) {
      console.error('Storage upload error:', error);
      
      if (error.message.includes('row-level security policy') || 
          error.message.includes('Unauthorized') || 
          error.message.includes('403') ||
          error.message.includes('Permission denied')) {
        // Guide user to set up their Supabase storage RLS policies correctly
        throw new Error(`Storage permission denied. Make sure you have the following RLS policies for the uploads bucket:
        1. Allow authenticated users to read their own files
        2. Allow authenticated users to upload files
        3. Allow authenticated users to update and delete their own files`);
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
  } catch (error) {
    console.error('Error in file upload:', error);
    throw error;
  }
};

// Check if bucket exists and create if needed
export const checkStorageBucket = async (): Promise<'exists' | 'not-exists' | 'permission-denied' | 'error'> => {
  try {
    console.log('Checking if uploads bucket exists...');
    // Check if bucket exists
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error checking buckets:', error);
      
      // Handle permission errors differently
      if (error.message.includes('row-level security policy') || 
          error.message.includes('Unauthorized') || 
          error.message.includes('403') ||
          error.message.includes('Permission denied')) {
        return 'permission-denied';
      }
      
      return 'error';
    }
    
    const uploadsBucket = buckets?.find(bucket => bucket.name === 'uploads');
    console.log('Uploads bucket exists:', !!uploadsBucket);
    return uploadsBucket ? 'exists' : 'not-exists';
  } catch (error) {
    console.error('Error checking storage bucket:', error);
    return 'error';
  }
};

// Create uploads bucket if it doesn't exist
export const createStorageBucket = async (): Promise<boolean> => {
  try {
    console.log('Creating uploads bucket...');
    const { data, error } = await supabase.storage.createBucket('uploads', {
      public: false,
      fileSizeLimit: 10485760, // 10MB
    });
    
    if (error) {
      console.error('Error creating bucket:', error);
      
      // Give more specific feedback for common errors
      if (error.message.includes('row-level security policy')) {
        console.log('Permission denied: You need admin privileges to create buckets in Supabase Storage');
      }
      
      return false;
    }
    
    console.log('Created uploads bucket successfully');
    return true;
  } catch (error) {
    console.error('Error creating storage bucket:', error);
    return false;
  }
};
