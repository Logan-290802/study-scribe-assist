
import { supabase } from '@/lib/supabase';

export const fetchChatHistoryFromDb = async (documentId: string, userId: string) => {
  try {
    // Check if the table exists first by using a direct query approach
    // Instead of querying information_schema which might not be accessible
    const { data: checkData, error: checkError } = await supabase
      .from('ai_chat_history')
      .select('id')
      .limit(1);
      
    if (checkError && checkError.message.includes('does not exist')) {
      console.info('ai_chat_history table does not exist yet');
      return null;
    }
    
    const { data, error } = await supabase
      .from('ai_chat_history')
      .select('*')
      .eq('document_id', documentId)
      .eq('user_id', userId)
      .order('timestamp', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    if (data && data.length > 0) {
      return data.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return null;
  }
};

export const saveChatMessageToDb = async (
  documentId: string, 
  userId: string, 
  role: 'user' | 'assistant', 
  content: string
) => {
  try {
    // Check if the table exists first by using a direct query approach
    const { data: checkData, error: checkError } = await supabase
      .from('ai_chat_history')
      .select('id')
      .limit(1);
      
    if (checkError && checkError.message.includes('does not exist')) {
      console.info('ai_chat_history table does not exist yet');
      return false;
    }
    
    const { error } = await supabase.from('ai_chat_history').insert({
      document_id: documentId,
      user_id: userId,
      role,
      content,
      timestamp: new Date().toISOString(),
    });
    
    if (error) {
      console.error('Error saving chat message:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error saving chat message:', error);
    return false;
  }
};
