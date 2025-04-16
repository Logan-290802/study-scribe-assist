
import { supabase } from '@/lib/supabase';
import { Reference } from '@/components/ai/types';

export interface KnowledgeBaseItem {
  id: string;
  title: string;
  content: string;
  file_path?: string;
  file_type?: string;
  authors?: string[];
  year?: string;
  source?: string;
  url?: string;
  format?: 'APA' | 'MLA' | 'Harvard';
  user_id: string;
  created_at: string;
  document_id?: string;
}

export const fetchKnowledgeBaseItems = async (userId: string): Promise<KnowledgeBaseItem[]> => {
  const { data: items, error } = await supabase
    .from('knowledge_base')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching knowledge base items:', error);
    return [];
  }
  
  return items || [];
};

export const addKnowledgeBaseItem = async (
  item: Omit<KnowledgeBaseItem, 'id' | 'created_at'>
): Promise<KnowledgeBaseItem | null> => {
  console.log('Adding knowledge base item:', item);
  
  try {
    const { data: newItem, error } = await supabase
      .from('knowledge_base')
      .insert(item)
      .select()
      .single();
    
    if (error) {
      console.error('Error adding knowledge base item:', error);
      return null;
    }
    
    console.log('Successfully added knowledge base item:', newItem);
    return newItem;
  } catch (error) {
    console.error('Error in addKnowledgeBaseItem:', error);
    return null;
  }
};

export const deleteKnowledgeBaseItem = async (id: string, userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('knowledge_base')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error deleting knowledge base item:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteKnowledgeBaseItem:', error);
    return false;
  }
};

export const convertFileToKnowledgeBaseItem = (
  filePath: string,
  fileType: string,
  fileName: string,
  userId: string
): Omit<KnowledgeBaseItem, 'id' | 'created_at'> => {
  return {
    title: fileName,
    content: `File uploaded: ${fileName}`,
    file_path: filePath,
    file_type: fileType,
    user_id: userId,
  };
};

export const convertReferenceToKnowledgeBaseItem = (
  reference: Reference,
  userId: string
): Omit<KnowledgeBaseItem, 'id' | 'created_at'> => {
  return {
    title: reference.title,
    content: reference.content || `Reference: ${reference.title}`,
    authors: reference.authors,
    year: reference.year,
    source: reference.source,
    url: reference.url,
    format: reference.format,
    file_path: reference.file_path,
    file_type: reference.file_path?.toLowerCase().includes('.pdf') ? 'application/pdf' : undefined,
    user_id: userId,
  };
};

export const getFilePublicUrl = (filePath: string): string => {
  const { data } = supabase.storage
    .from('uploads')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};
