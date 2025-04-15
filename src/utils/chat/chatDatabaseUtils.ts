
import { supabase } from '@/lib/supabase';

export const fetchChatHistoryFromDb = async (documentId: string, userId: string) => {
  try {
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
