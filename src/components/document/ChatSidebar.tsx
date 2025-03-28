
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import AiChat, { Reference } from '@/components/ai/AiChat';
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
    
    // Simulate AI response (in a real app, this would call an API)
    setTimeout(() => {
      const aiResponse = { 
        role: 'assistant' as const, 
        content: `I'll help you with "${message}". Here's what I found...` 
      };
      
      setChatHistory(prevHistory => [...prevHistory, aiResponse]);
      
      // Save AI response to Supabase
      if (documentId && userId) {
        supabase.from('ai_chat_history').insert({
          document_id: documentId,
          user_id: userId,
          role: 'assistant',
          content: aiResponse.content,
          timestamp: new Date().toISOString(),
        }).then(({ error }) => {
          if (error) console.error('Error saving AI response:', error);
        });
      }
    }, 1000);
  };

  return (
    <Card className="sticky top-24">
      <CardContent className="p-4">
        <AiChat
          onAddReference={onAddReference}
          documentId={documentId}
          onNewMessage={handleNewMessage}
        />
      </CardContent>
    </Card>
  );
};

export default ChatSidebar;
