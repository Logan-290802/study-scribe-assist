
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AiChat, Reference } from '@/components/ai';
import { supabase } from '@/lib/supabase';

interface ChatSidebarProps {
  documentId: string;
  onAddReference: (reference: Reference) => void;
  chatHistory: { role: 'user' | 'assistant'; content: string }[];
  setChatHistory: React.Dispatch<React.SetStateAction<{ role: 'user' | 'assistant'; content: string }[]>>;
  userId?: string;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  documentId,
  onAddReference,
  chatHistory,
  setChatHistory,
  userId
}) => {
  // Load chat history from Supabase when component mounts
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
          
          setChatHistory(history);
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };

    fetchChatHistory();
  }, [documentId, userId, setChatHistory]);
  
  const handleNewMessage = (message: string) => {
    const newMessage = { role: 'user' as const, content: message };
    setChatHistory([...chatHistory, newMessage]);
    
    // Save to Supabase
    if (documentId && userId) {
      supabase.from('ai_chat_history').insert({
        document_id: documentId,
        user_id: userId,
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      }).then(({ error }) => {
        if (error) console.error('Error saving chat message:', error);
      });
    }
  };

  return (
    <Card className="h-full sticky top-24">
      <CardContent className="p-4 h-full">
        <AiChat
          onAddReference={onAddReference}
          documentId={documentId}
          onNewMessage={handleNewMessage}
          chatHistory={chatHistory}
        />
      </CardContent>
    </Card>
  );
};

export default ChatSidebar;
