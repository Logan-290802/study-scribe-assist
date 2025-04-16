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
  document_id?: string;  // Add document context
}

export const fetchKnowledgeBaseItems = async (userId: string): Promise<KnowledgeBaseItem[]> => {
  try {
    // Check if table exists first
    const { data, error: checkError } = await supabase
      .from('knowledge_base')
      .select('id')
      .limit(1);
    
    if (checkError && checkError.message.includes('does not exist')) {
      console.warn('Knowledge base table does not exist yet. Creating table...');
      
      // Create the table if it doesn't exist
      const { error: createError } = await supabase.rpc('create_knowledge_base_if_not_exists');
      
      if (createError) {
        console.warn('Could not auto-create table, please create it manually:', createError);
        return [];
      }
    }
    
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
  } catch (error) {
    console.error('Error fetching knowledge base items:', error);
    return [];
  }
};

export const addKnowledgeBaseItem = async (
  item: Omit<KnowledgeBaseItem, 'id' | 'created_at'>
): Promise<KnowledgeBaseItem | null> => {
  try {
    // Check if table exists first
    const { data, error: checkError } = await supabase
      .from('knowledge_base')
      .select('id')
      .limit(1);
    
    if (checkError && checkError.message.includes('does not exist')) {
      console.warn('Knowledge base table does not exist yet. Creating table...');
      
      // Create the table if it doesn't exist
      const { error: createError } = await supabase.rpc('create_knowledge_base_if_not_exists');
      
      if (createError) {
        console.warn('Could not auto-create table, please create it manually:', createError);
        return null;
      }
    }
    
    const { data: newItem, error } = await supabase
      .from('knowledge_base')
      .insert(item)
      .select()
      .single();
    
    if (error) {
      console.error('Error adding knowledge base item:', error);
      return null;
    }
    
    return newItem;
  } catch (error) {
    console.error('Error adding knowledge base item:', error);
    return null;
  }
};

export const deleteKnowledgeBaseItem = async (id: string, userId: string): Promise<boolean> => {
  try {
    // Check if table exists first
    const { data: tables, error: tableError } = await supabase
      .from('knowledge_base')
      .select('*')
      .limit(1);
    
    if (tableError && tableError.message.includes('does not exist')) {
      console.warn('Knowledge base table does not exist yet.');
      return false;
    }
    
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
    console.error('Error deleting knowledge base items:', error);
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
    content: reference.content || '',
    authors: reference.authors,
    year: reference.year,
    source: reference.source,
    url: reference.url,
    format: reference.format,
    file_path: reference.file_path,
    user_id: userId,
  };
};

export const getFilePublicUrl = (filePath: string): string => {
  const { data } = supabase.storage
    .from('reference-pdfs')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};
