
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
  // Simplify the path structure to avoid potential permissions issues
  const filePath = `${Date.now()}_${file.name}`;
  
  try {
    // Try direct upload without checking or creating bucket first
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
          error.statusCode === 403) {
        throw new Error(`Storage permission denied. Please contact your administrator to set up storage permissions.`);
      }
      
      throw error;
    }
    
    return { 
      path: filePath,
      fileType
    };
  } catch (error) {
    console.error('Error in file upload:', error);
    throw error;
  }
};

// Simplified bucket check - we don't try to create it automatically, just check if it exists
export const checkStorageBucket = async (): Promise<boolean> => {
  try {
    // Check if bucket exists
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error checking buckets:', error);
      return false;
    }
    
    const uploadsBucket = buckets?.find(bucket => bucket.name === 'uploads');
    return !!uploadsBucket;
  } catch (error) {
    console.error('Error checking storage bucket:', error);
    return false;
  }
};
