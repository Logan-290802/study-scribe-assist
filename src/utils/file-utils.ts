
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

export const downloadAndOpenFile = async (filePath: string) => {
  try {
    const { data, error } = await supabase.storage
      .from('uploads')
      .download(filePath);
      
    if (error) {
      console.error('Error downloading file:', error);
      toast({
        title: 'Download Error',
        description: 'Unable to download the file. Please try again.',
        variant: 'destructive',
      });
      return;
    }
    
    const url = URL.createObjectURL(data);
    window.open(url, '_blank');
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
    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(filePath);
      
    return publicUrl;
  } catch (error) {
    console.error('Error getting image URL:', error);
    return '';
  }
};
