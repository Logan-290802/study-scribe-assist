
import { supabase } from '@/lib/supabase';

export const handlePdfUpload = async (
  file: File,
  documentId: string,
  userId: string
): Promise<void> => {
  if (file.type !== 'application/pdf') {
    throw new Error('Invalid file format. Please upload a PDF file.');
  }
  
  const filePath = `documents/${documentId}/${Date.now()}_${file.name}`;
  const { error } = await supabase.storage
    .from('uploads')
    .upload(filePath, file);
    
  if (error) {
    throw error;
  }
};
