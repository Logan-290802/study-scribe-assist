
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { aiServiceManager } from '@/services/ai/AiServiceManager';
import { useToast } from '@/components/ui/use-toast';

export const useDocumentAiChat = (documentId: string | undefined, userId: string | undefined) => {
  const { toast } = useToast();
  const [aiChatHistory, setAiChatHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: 'Hello! I\'m your AI research assistant. How can I help you today?' }
  ]);

  useEffect(() => {
    if (!documentId || !userId) return;

    const fetchChatHistory = async () => {
      try {
        const { data: tablesData, error: tablesError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public')
          .eq('table_name', 'ai_chat_history');
          
        if (tablesError) {
          console.error('Error checking for table:', tablesError);
          return;
        }
        
        if (!tablesData || tablesData.length === 0) {
          console.info('ai_chat_history table does not exist yet');
          return;
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

  // This function is now only called when the ChatInput component sends the message
  // The TextSelectionMenu only populates the input field but doesn't trigger this directly
  const handleAiAction = async (action: string, selection: string) => {
    if (!selection.trim()) {
      toast({
        title: `No text selected`,
        description: `Please select some text first to perform this action.`,
        duration: 3000,
      });
      return;
    }

    let userQuery = '';
    
    switch (action) {
      case 'research':
        userQuery = `Find scholarly information about "${selection}". Include key concepts, historical context, and relevant research.`;
        break;
      case 'critique':
        userQuery = `Evaluate this text for clarity, logic, and effectiveness: "${selection}". Identify strengths and weaknesses, and suggest specific improvements.`;
        break;
      case 'expand':
        userQuery = `Develop and elaborate on this idea: "${selection}". Provide deeper context, examples, and related concepts.`;
        break;
      default:
        userQuery = `Please ${action} the following text: "${selection}"`;
    }
    
    const newMessage = { role: 'user' as const, content: userQuery };
    setAiChatHistory(prevHistory => [...prevHistory, newMessage]);
    
    if (documentId && userId) {
      try {
        const { data: tablesData, error: tablesError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public')
          .eq('table_name', 'ai_chat_history');
          
        if (tablesError) {
          console.error('Error checking for table:', tablesError);
        } else if (tablesData && tablesData.length > 0) {
          const { error } = await supabase.from('ai_chat_history').insert({
            document_id: documentId,
            user_id: userId,
            role: 'user',
            content: userQuery,
            timestamp: new Date().toISOString(),
          });
          
          if (error) throw error;
        } else {
          console.info('ai_chat_history table does not exist yet');
        }
      } catch (error) {
        console.error('Error saving chat message:', error);
      }
    }
    
    const actionTitles = {
      'research': 'Researching topic',
      'critique': 'Analyzing writing',
      'expand': 'Developing concept'
    };
    
    toast({
      title: actionTitles[action as keyof typeof actionTitles] || `AI ${action} in progress...`,
      description: `Processing your ${action} request for the selected text.`,
      duration: 3000,
    });
    
    try {
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
      
      let responsePrefix = '';
      switch (action) {
        case 'research':
          responsePrefix = '📚 **Research Findings**\n\n';
          break;
        case 'critique':
          responsePrefix = '🧐 **Writing Analysis**\n\n';
          break;
        case 'expand':
          responsePrefix = '✨ **Concept Development**\n\n';
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
      
      const successTitles = {
        'research': 'Research complete',
        'critique': 'Analysis complete',
        'expand': 'Concept developed'
      };
      
      toast({
        title: successTitles[action as keyof typeof successTitles] || `${action.charAt(0).toUpperCase() + action.slice(1)} complete`,
        description: 'Your AI assistant has processed your request.',
        duration: 3000,
      });
      
    } catch (error) {
      console.error(`Error during AI ${action}:`, error);
      
      const errorResponse = { 
        role: 'assistant' as const, 
        content: `I encountered an error while processing your ${action} request. Please try again later.`
      };
      
      setAiChatHistory(prevHistory => [...prevHistory, errorResponse]);
      
      if (documentId && userId) {
        const { data: tablesData, error: tablesError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public')
          .eq('table_name', 'ai_chat_history');
          
        if (tablesError) {
          console.error('Error checking for table:', tablesError);
        } else if (tablesData && tablesData.length > 0) {
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
