
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
  // Create a more simple path structure to avoid potential RLS issues
  const filePath = `user_${userId}/${Date.now()}_${file.name}`;
  
  try {
    // Make sure the bucket exists and has proper policies
    await ensureStorageBucket();
    
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (error) {
      console.error('Storage upload error:', error);
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

// Ensure the storage bucket exists with proper policies
const ensureStorageBucket = async () => {
  try {
    // Check if bucket exists
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error checking buckets:', error);
      throw error;
    }
    
    const uploadsBucket = buckets?.find(bucket => bucket.name === 'uploads');
    
    if (!uploadsBucket) {
      // Create bucket if it doesn't exist
      const { error: createError } = await supabase.storage.createBucket('uploads', {
        public: true
      });
      
      if (createError) {
        console.error('Error creating uploads bucket:', createError);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring storage bucket:', error);
    return false;
  }
};
