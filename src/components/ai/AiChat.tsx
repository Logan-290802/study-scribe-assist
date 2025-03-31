import React, { useState, useRef, useEffect } from 'react';
import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import ChatMessage from './chat/ChatMessage';
import ChatInput from './chat/ChatInput';
import ChatActions from './chat/ChatActions';
import UploadedFile from './chat/UploadedFile';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/store/AuthContext';
import { v4 as uuidv4 } from '@/lib/utils/uuid';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AiChatProps {
  onAddReference: (reference: Reference) => void;
  onNewMessage?: (message: string) => void;
  documentId?: string;
  chatHistory?: { role: 'user' | 'assistant'; content: string }[];
}

export interface Reference {
  id: string;
  title: string;
  authors: string[];
  year: string;
  url?: string;
  source: string;
  format: 'APA' | 'MLA' | 'Harvard';
  content?: string;
}

export const AiChat: React.FC<AiChatProps> = ({ 
  onAddReference, 
  onNewMessage, 
  documentId,
  chatHistory 
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI research assistant. I can help you search for information, suggest references, and assist with your academic writing. What can I help you with today?',
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedPdf, setUploadedPdf] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (chatHistory && chatHistory.length > 0) {
      const convertedMessages = chatHistory.map((item, index) => ({
        id: index.toString(),
        role: item.role,
        content: item.content,
        timestamp: new Date()
      }));
      
      if (convertedMessages.length > 0) {
        setMessages([messages[0], ...convertedMessages]);
      }
    }
  }, [chatHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (input: string) => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    
    if (onNewMessage) {
      onNewMessage(input);
    } else {
      setIsLoading(true);

      setTimeout(() => {
        handleAiResponse(input);
      }, 1500);
    }
  };

  const handleAiResponse = (input: string) => {
    let aiResponse: Message;
    
    if (input.toLowerCase().includes('reference') || input.toLowerCase().includes('citation')) {
      aiResponse = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I found this reference that might be helpful for your research on cognitive learning theory:\n\n**Sweller, J., van Merriënboer, J. J. G., & Paas, F. (2019). Cognitive Architecture and Instructional Design: 20 Years Later. Educational Psychology Review, 31(2), 261–292.**\n\nWould you like me to add this to your references list?",
        timestamp: new Date(),
      };
    } else if (input.toLowerCase().includes('summarize') || input.toLowerCase().includes('summary')) {
      aiResponse = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Based on the literature, here's a summary of key points about cognitive load theory:\n\n• Cognitive load theory focuses on the limitations of working memory during learning\n• It identifies three types of cognitive load: intrinsic, extraneous, and germane\n• Instructional design should minimize extraneous load and optimize germane load\n• Split-attention and redundancy effects can impair learning efficiency\n• Schema acquisition and automation are key mechanisms for knowledge transfer\n\nWould you like me to elaborate on any of these points?",
        timestamp: new Date(),
      };
    } else if (uploadedPdf) {
      aiResponse = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I've analyzed the PDF "${uploadedPdf.name}" and here are the key findings:\n\n• The paper discusses cognitive load theory and its applications in education\n• It emphasizes the importance of managing working memory load during instruction\n• The authors propose a new framework for instructional design based on cognitive architecture\n• There are several practical implications for classroom teaching and online learning\n\nWould you like me to provide more specific details about any of these points or generate a citation for this paper?`,
        timestamp: new Date(),
      };
      setUploadedPdf(null);
    } else {
      aiResponse = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I can help you with that. To provide the most relevant assistance, could you specify if you need:\n\n1. Research information on a particular topic\n2. Help with structuring your argument\n3. Citation suggestions for your current paragraph\n4. Feedback on your writing\n\nAlternatively, you could share a specific paragraph you're working on, or upload a PDF for me to analyze.",
        timestamp: new Date(),
      };
    }
    
    setMessages((prev) => [...prev, aiResponse]);
    setIsLoading(false);
    
    if (user && documentId) {
      saveChatMessageToSupabase({
        role: 'assistant',
        content: aiResponse.content,
        document_id: documentId,
        user_id: user.id,
      });
    }
  };

  const saveChatMessageToSupabase = async (message: {
    role: 'user' | 'assistant';
    content: string;
    document_id: string;
    user_id: string;
  }) => {
    try {
      const { error } = await supabase.from('ai_chat_history').insert({
        ...message,
        timestamp: new Date().toISOString(),
      });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  };

  const addSampleReference = async () => {
    const newReference: Reference = {
      id: uuidv4(),
      title: "Cognitive Architecture and Instructional Design: 20 Years Later",
      authors: ["Sweller, J.", "van Merriënboer, J. J. G.", "Paas, F."],
      year: "2019",
      source: "Educational Psychology Review, 31(2), 261–292",
      url: "https://doi.org/10.1007/s10648-019-09465-5",
      format: "APA",
    };
    
    onAddReference(newReference);
    
    const confirmationMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: "I've added this reference to your reference list. You can now cite it in your document.",
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, confirmationMessage]);
    
    if (user && documentId) {
      saveChatMessageToSupabase({
        role: 'assistant',
        content: confirmationMessage.content,
        document_id: documentId,
        user_id: user.id,
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setUploadedPdf(file);
        
        const userMessage: Message = {
          id: Date.now().toString(),
          role: 'user',
          content: `I've uploaded a PDF: "${file.name}". Can you analyze it for me?`,
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);
        
        if (user && documentId) {
          try {
            const filePath = `documents/${documentId}/${Date.now()}_${file.name}`;
            
            const { data, error } = await supabase.storage
              .from('uploads')
              .upload(filePath, file);
            
            if (error) {
              throw error;
            }
            
            const { data: urlData } = supabase.storage
              .from('uploads')
              .getPublicUrl(filePath);
            
            if (urlData) {
              setUploadedFileUrl(urlData.publicUrl);
              
              await supabase.from('file_uploads').insert({
                name: file.name,
                size: file.size,
                type: file.type,
                path: filePath,
                document_id: documentId,
                user_id: user.id,
                created_at: new Date().toISOString(),
              });
              
              saveChatMessageToSupabase({
                role: 'user',
                content: userMessage.content,
                document_id: documentId,
                user_id: user.id,
              });
            }
          } catch (error) {
            console.error('Error uploading file:', error);
          }
        }
        
        setTimeout(() => {
          const aiResponse: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `I'm analyzing the PDF "${file.name}" now. Give me a moment to process it...`,
            timestamp: new Date(),
          };
          
          setMessages((prev) => [...prev, aiResponse]);
          
          if (user && documentId) {
            saveChatMessageToSupabase({
              role: 'assistant',
              content: aiResponse.content,
              document_id: documentId,
              user_id: user.id,
            });
          }
          
          setTimeout(() => {
            const completionMessage: Message = {
              id: (Date.now() + 2).toString(),
              role: 'assistant',
              content: `I've analyzed the PDF "${file.name}" and here are the key findings:\n\n• The paper discusses cognitive load theory and its applications in education\n• It emphasizes the importance of managing working memory load during instruction\n• The authors propose a new framework for instructional design based on cognitive architecture\n• There are several practical implications for classroom teaching and online learning\n\nWould you like me to provide more specific details about any of these points or generate a citation for this paper?`,
              timestamp: new Date(),
            };
            
            setMessages((prev) => [...prev, completionMessage]);
            setIsLoading(false);
            
            if (user && documentId) {
              saveChatMessageToSupabase({
                role: 'assistant',
                content: completionMessage.content,
                document_id: documentId,
                user_id: user.id,
              });
            }
          }, 2000);
        }, 1500);
      } else {
        alert('Please upload a PDF file');
      }
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleSearchAction = () => {
    handleSendMessage("Can you help me research the latest findings on cognitive load theory?");
  };

  const handleCitationsAction = () => {
    handleSendMessage("Can you suggest some key references for my paper on educational psychology?");
  };

  const handleSummarizeAction = () => {
    handleSendMessage("Can you summarize the main theories of learning?");
  };

  return (
    <div className="flex flex-col h-full border rounded-md overflow-hidden glass-card">
      <div className="p-3 border-b bg-gray-50/80 backdrop-blur-sm flex items-center gap-2">
        <Bot className="w-5 h-5 text-blue-500" />
        <h3 className="font-medium">AI Research Assistant</h3>
      </div>
      
      <div className="flex-grow overflow-y-auto p-4 space-y-4 thin-scrollbar">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            id={message.id}
            role={message.role}
            content={message.content}
            timestamp={message.timestamp}
            onAddReference={message.role === 'assistant' && message.content.includes('reference') ? addSampleReference : undefined}
          />
        ))}
        
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-gray-100 text-gray-800 rounded-lg rounded-tl-none max-w-[85%] p-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        {uploadedPdf && (
          <UploadedFile 
            file={uploadedPdf} 
            onRemove={() => setUploadedPdf(null)} 
          />
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-3 border-t">
        <ChatInput 
          onSendMessage={handleSendMessage}
          onUploadFile={triggerFileUpload}
          isLoading={isLoading}
          disabled={!user}
          placeholder={user ? "Ask your AI research assistant..." : "Sign in to chat with AI assistant"}
        />
        
        <ChatActions
          onSearchClick={handleSearchAction}
          onCitationsClick={handleCitationsAction}
          onSummarizeClick={handleSummarizeAction}
          disabled={!user || isLoading}
        />
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="application/pdf"
          className="hidden"
        />
      </div>
    </div>
  );
};

export default AiChat;
