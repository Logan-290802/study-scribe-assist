
import React, { useState, useRef, useEffect } from 'react';
import { SendHorizontal, Bot, Clipboard, Search, BookOpen, BookText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AiChatProps {
  onAddReference: (reference: Reference) => void;
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

export const AiChat: React.FC<AiChatProps> = ({ onAddReference }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI research assistant. I can help you search for information, suggest references, and assist with your academic writing. What can I help you with today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      let aiResponse: Message;
      
      if (input.toLowerCase().includes('reference') || input.toLowerCase().includes('citation')) {
        // Generate sample reference
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
      } else {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I can help you with that. To provide the most relevant assistance, could you specify if you need:\n\n1. Research information on a particular topic\n2. Help with structuring your argument\n3. Citation suggestions for your current paragraph\n4. Feedback on your writing\n\nAlternatively, you could share a specific paragraph you're working on, and I can provide more targeted help.",
          timestamp: new Date(),
        };
      }
      
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const addSampleReference = () => {
    const newReference: Reference = {
      id: Date.now().toString(),
      title: "Cognitive Architecture and Instructional Design: 20 Years Later",
      authors: ["Sweller, J.", "van Merriënboer, J. J. G.", "Paas, F."],
      year: "2019",
      source: "Educational Psychology Review, 31(2), 261–292",
      url: "https://doi.org/10.1007/s10648-019-09465-5",
      format: "APA",
    };
    
    onAddReference(newReference);
    
    // Add confirmation message
    setMessages((prev) => [
      ...prev, 
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I've added this reference to your reference list. You can now cite it in your document.",
        timestamp: new Date(),
      }
    ]);
  };

  return (
    <div className="flex flex-col h-full border rounded-md overflow-hidden glass-card">
      <div className="p-3 border-b bg-gray-50/80 backdrop-blur-sm flex items-center gap-2">
        <Bot className="w-5 h-5 text-blue-500" />
        <h3 className="font-medium">AI Research Assistant</h3>
      </div>
      
      <div className="flex-grow overflow-y-auto p-4 space-y-4 thin-scrollbar">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex animate-fade-in",
              message.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-lg p-3",
                message.role === 'user' 
                  ? "bg-blue-500 text-white rounded-tr-none" 
                  : "bg-gray-100 text-gray-800 rounded-tl-none"
              )}
            >
              <div className="whitespace-pre-line">{message.content}</div>
              
              {message.role === 'assistant' && message.content.includes('reference') && (
                <div className="mt-2 flex gap-2">
                  <button 
                    onClick={addSampleReference}
                    className="text-xs py-1 px-2 bg-white text-blue-600 rounded border border-blue-200 hover:bg-blue-50 transition-colors flex items-center gap-1"
                  >
                    <BookText className="w-3 h-3" />
                    Add to References
                  </button>
                  <button className="text-xs py-1 px-2 bg-white text-gray-600 rounded border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-1">
                    <Clipboard className="w-3 h-3" />
                    Copy
                  </button>
                </div>
              )}
              
              <div className="text-xs mt-1 opacity-70">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
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
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-3 border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your AI research assistant..."
            className="flex-grow p-2 border rounded-md bg-white/80 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={cn(
              "p-2 rounded-md transition-colors text-white",
              input.trim() && !isLoading 
                ? "bg-blue-500 hover:bg-blue-600" 
                : "bg-gray-300 cursor-not-allowed"
            )}
          >
            <SendHorizontal className="w-5 h-5" />
          </button>
        </form>
        
        <div className="flex gap-1 mt-2 text-xs text-gray-500">
          <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
            <Search className="w-3 h-3" />
            Research
          </button>
          <span>•</span>
          <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
            <BookOpen className="w-3 h-3" />
            Find Citations
          </button>
          <span>•</span>
          <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
            <Bot className="w-3 h-3" />
            Summarize
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiChat;
