
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { aiServiceManager } from '@/services/ai/AiServiceManager';
import { toast } from '@/hooks/use-toast';

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

  const handleAiAction = async (action: string, selection: string) => {
    let userQuery = '';
    
    switch (action) {
      case 'research':
        userQuery = `Please research the following text: "${selection}"`;
        break;
      case 'critique':
        userQuery = `Please critique the following text: "${selection}"`;
        break;
      case 'expand':
        userQuery = `Please expand on the following text: "${selection}"`;
        break;
      default:
        userQuery = `Please ${action} the following text: "${selection}"`;
    }
    
    // Add the user query to chat history immediately
    const newMessage = { role: 'user' as const, content: userQuery };
    setAiChatHistory(prevHistory => [...prevHistory, newMessage]);
    
    if (documentId && userId) {
      try {
        const { error } = await supabase.from('ai_chat_history').insert({
          document_id: documentId,
          user_id: userId,
          role: 'user',
          content: userQuery,
          timestamp: new Date().toISOString(),
        });
        
        if (error) throw error;
      } catch (error) {
        console.error('Error saving chat message:', error);
      }
    }
    
    // Show a toast notification for the action
    toast({
      title: `AI ${action} in progress...`,
      description: `Processing your ${action} request for the selected text.`,
      duration: 3000,
    });
    
    try {
      // Process with AI service
      let aiAction: 'research' | 'critique' | 'expand';
      
      switch (action) {
        case 'research':
          aiAction = 'research';
          break;
        case 'critique':
          aiAction = 'critique';
          break;
        case 'expand':
          aiAction = 'expand';
          break;
        default:
          aiAction = 'research';
      }
      
      const aiResult = await aiServiceManager.processTextWithAi(selection, aiAction);
      
      // Format the AI response based on the action
      let responsePrefix = '';
      switch (action) {
        case 'research':
          responsePrefix = '📚 **Research Results**\n\n';
          break;
        case 'critique':
          responsePrefix = '🧐 **Critique Analysis**\n\n';
          break;
        case 'expand':
          responsePrefix = '📝 **Expanded Exploration**\n\n';
          break;
        default:
          responsePrefix = '';
      }
      
      const formattedResponse = `${responsePrefix}${aiResult.content}${aiResult.source ? `\n\n*Source: ${aiResult.source}*` : ''}`;
      
      const aiResponse = { 
        role: 'assistant' as const, 
        content: formattedResponse
      };
      
      setAiChatHistory(prevHistory => [...prevHistory, aiResponse]);
      
      // Save AI response to Supabase
      if (documentId && userId) {
        const { error } = await supabase.from('ai_chat_history').insert({
          document_id: documentId,
          user_id: userId,
          role: 'assistant',
          content: formattedResponse,
          timestamp: new Date().toISOString(),
        });
        
        if (error) throw error;
      }
      
      toast({
        title: `${action.charAt(0).toUpperCase() + action.slice(1)} complete`,
        description: 'Your AI assistant has processed your request.',
        duration: 3000,
      });
      
    } catch (error) {
      console.error(`Error during AI ${action}:`, error);
      
      // Create error response
      const errorResponse = { 
        role: 'assistant' as const, 
        content: `I encountered an error while processing your ${action} request. Please try again later.`
      };
      
      setAiChatHistory(prevHistory => [...prevHistory, errorResponse]);
      
      // Save error response to Supabase
      if (documentId && userId) {
        supabase.from('ai_chat_history').insert({
          document_id: documentId,
          user_id: userId,
          role: 'assistant',
          content: errorResponse.content,
          timestamp: new Date().toISOString(),
        }).then(({ error }) => {
          if (error) console.error('Error saving AI error response:', error);
        });
      }
      
      toast({
        title: 'Error',
        description: `Failed to process your ${action} request.`,
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  return {
    aiChatHistory,
    setAiChatHistory,
    handleAiAction
  };
};
