
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

export const downloadAndOpenFile = async (filePath: string) => {
  try {
    // Check if the file path is valid
    if (!filePath || typeof filePath !== 'string') {
      toast({
        title: 'Invalid File',
        description: 'The file path is invalid or missing.',
        variant: 'destructive',
      });
      return;
    }
    
    console.log('Attempting to download file:', filePath);
    
    const { data, error } = await supabase.storage
      .from('uploads')
      .download(filePath);
      
    if (error) {
      console.error('Error downloading file:', error);
      
      let errorMessage = 'Unable to download the file. Please try again.';
      
      // Provide more specific error messages
      if (error.message.includes('not found') || error.statusCode === 404) {
        errorMessage = 'File not found. It may have been deleted or moved.';
      } else if (error.message.includes('permission') || error.statusCode === 403) {
        errorMessage = 'You do not have permission to access this file.';
      }
      
      toast({
        title: 'Download Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return;
    }
    
    if (!data) {
      console.error('No data returned when downloading file');
      toast({
        title: 'Download Error',
        description: 'No data returned when downloading the file.',
        variant: 'destructive',
      });
      return;
    }
    
    console.log('File downloaded successfully, creating blob URL');
    const url = URL.createObjectURL(data);
    
    // Open the file in a new tab
    window.open(url, '_blank');
    
    // Clean up the blob URL after a short delay
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    
  } catch (error) {
    console.error('Error handling file view:', error);
    toast({
      title: 'Error',
      description: 'Unable to open the file. Please try again.',
      variant: 'destructive',
    });
  }
};

export const getFileIcon = (filePath: string | undefined, fileType: string | undefined) => {
  if (!filePath) return 'text';
  
  const type = fileType?.toLowerCase() || '';
  
  if (type.includes('image')) {
    return 'image';
  } else if (type.includes('pdf')) {
    return 'text';
  } else {
    return 'file';
  }
};

export const getPublicImageUrl = async (filePath: string) => {
  try {
    // Validate file path
    if (!filePath || typeof filePath !== 'string') {
      console.error('Invalid file path provided to getPublicImageUrl');
      return '';
    }
    
    console.log('Getting public URL for:', filePath);
    
    const { data } = supabase.storage
      .from('uploads')
      .getPublicUrl(filePath);
      
    if (!data || !data.publicUrl) {
      console.error('Failed to get public URL for file', filePath);
      return '';
    }
      
    return data.publicUrl;
  } catch (error) {
    console.error('Error getting image URL:', error);
    return '';
  }
};
