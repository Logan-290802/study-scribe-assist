
import { supabase } from '@/lib/supabase';

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
  const filePath = `documents/${documentId}/${Date.now()}_${file.name}`;
  
  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(filePath, file);
    
  if (error) {
    throw error;
  }

  // After successful upload, add to knowledge base if it's a PDF
  if (fileType === 'application/pdf') {
    try {
      await addToKnowledgeBase(file, filePath, documentId, userId);
    } catch (knowledgeBaseError) {
      console.error('Error adding to knowledge base:', knowledgeBaseError);
      // Continue even if knowledge base addition fails
    }
  }
  
  return { 
    path: filePath,
    fileType
  };
};

// Function to add the uploaded file to knowledge base
const addToKnowledgeBase = async (
  file: File,
  filePath: string,
  documentId: string,
  userId: string
) => {
  // Extract filename without extension for title
  const fileName = file.name.replace(/\.[^/.]+$/, "");
  
  // Create a new knowledge base entry
  const { data, error } = await supabase
    .from('knowledge_base_references')
    .insert({
      title: fileName,
      authors: [], // Will be populated by AI later
      year: new Date().getFullYear().toString(),
      type: 'other', // Default type
      summary: 'Uploaded from document editor', // Default summary
      tags: [], // Will be populated by AI later
      has_pdf: true,
      discipline: '',
      usage_count: 1, // Initial usage
      is_favorite: false,
      user_id: userId,
      document_id: documentId,
      pdf_path: filePath,
      citation_format: 'APA'
    })
    .select()
    .single();
    
  if (error) {
    throw error;
  }
  
  return data;
};
