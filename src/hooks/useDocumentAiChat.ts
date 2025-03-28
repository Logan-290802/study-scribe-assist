
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const useDocumentAiChat = (documentId: string | undefined, userId: string | undefined) => {
  const [aiChatHistory, setAiChatHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: 'Hello! I\'m your AI research assistant. How can I help you today?' }
  ]);

  // Load chat history from Supabase
  useEffect(() => {
    if (!documentId || !userId) return;

    const fetchChatHistory = async () => {
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
          const history = data.map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          }));
          
          setAiChatHistory(history);
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };

    fetchChatHistory();
  }, [documentId, userId]);

  const handleAiAction = (action: string, selection: string) => {
    const userQuery = `Please ${action} the following text: "${selection}"`;
    const newMessage = { role: 'user' as const, content: userQuery };
    setAiChatHistory([...aiChatHistory, newMessage]);
    
    if (documentId && userId) {
      supabase.from('ai_chat_history').insert({
        document_id: documentId,
        user_id: userId,
        role: 'user',
        content: userQuery,
        timestamp: new Date().toISOString(),
      }).then(({ error }) => {
        if (error) console.error('Error saving chat message:', error);
      });
    }
    
    setTimeout(() => {
      let response;
      switch (action) {
        case 'elaborate':
          response = `I've expanded on your selection by adding more context and details. "${selection}" could be enhanced with additional supporting evidence...`;
          break;
        case 'summarize':
          response = `Here's a concise summary of your text: The main point of "${selection}" is...`;
          break;
        case 'research':
          response = `Based on my research about "${selection}", here are some relevant facts and sources: ...`;
          break;
        default:
          response = `I've analyzed "${selection}" as requested.`;
      }
      
      const aiResponse = { role: 'assistant' as const, content: response };
      setAiChatHistory(prevHistory => [...prevHistory, aiResponse]);
      
      if (documentId && userId) {
        supabase.from('ai_chat_history').insert({
          document_id: documentId,
          user_id: userId,
          role: 'assistant',
          content: response,
          timestamp: new Date().toISOString(),
        }).then(({ error }) => {
          if (error) console.error('Error saving AI response:', error);
        });
      }
    }, 1000);
  };

  return {
    aiChatHistory,
    setAiChatHistory,
    handleAiAction
  };
};
