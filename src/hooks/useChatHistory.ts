
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { fetchChatHistoryFromDb, saveChatMessageToDb } from '@/utils/chat/chatDatabaseUtils';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

export const useChatHistory = (documentId: string | undefined, userId: string | undefined) => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!documentId || !userId) return;

    const loadChatHistory = async () => {
      try {
        const history = await fetchChatHistoryFromDb(documentId, userId);
        
        if (history && history.length > 0) {
          // Use the history from database
          setChatHistory(history);
        } else if (!isInitialized) {
          // Only add welcome message if there's no history and we haven't initialized yet
          setChatHistory([
            { role: 'assistant', content: 'Hello! I\'m your AI research assistant. How can I help you today?' }
          ]);
          
          // Save the welcome message to the database
          await saveChatMessageToDb(
            documentId, 
            userId, 
            'assistant', 
            'Hello! I\'m your AI research assistant. How can I help you today?'
          );
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    };

    loadChatHistory();
  }, [documentId, userId, isInitialized]);

  const addMessageToHistory = async (role: 'user' | 'assistant', content: string) => {
    const newMessage = { role, content };
    setChatHistory(prevHistory => [...prevHistory, newMessage]);
    
    if (documentId && userId) {
      await saveChatMessageToDb(documentId, userId, role, content);
    }
    
    return newMessage;
  };

  return {
    chatHistory,
    setChatHistory,
    addMessageToHistory
  };
};
