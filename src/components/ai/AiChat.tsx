
import React, { useState, useRef, useEffect } from 'react';
import { SendHorizontal, Bot, Clipboard, Search, BookOpen, BookText, Upload, File, X } from 'lucide-react';
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
  const [uploadedPdf, setUploadedPdf] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setUploadedPdf(file);
        
        // Send a message about the uploaded PDF
        const userMessage: Message = {
          id: Date.now().toString(),
          role: 'user',
          content: `I've uploaded a PDF: "${file.name}". Can you analyze it for me?`,
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);
        
        // Simulate processing time
        setTimeout(() => {
          const aiResponse: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `I'm analyzing the PDF "${file.name}" now. Give me a moment to process it...`,
            timestamp: new Date(),
          };
          
          setMessages((prev) => [...prev, aiResponse]);
          
          // Simulate completion after another delay
          setTimeout(() => {
            const completionMessage: Message = {
              id: (Date.now() + 2).toString(),
              role: 'assistant',
              content: `I've analyzed the PDF "${file.name}" and here are the key findings:\n\n• The paper discusses cognitive load theory and its applications in education\n• It emphasizes the importance of managing working memory load during instruction\n• The authors propose a new framework for instructional design based on cognitive architecture\n• There are several practical implications for classroom teaching and online learning\n\nWould you like me to provide more specific details about any of these points or generate a citation for this paper?`,
              timestamp: new Date(),
            };
            
            setMessages((prev) => [...prev, completionMessage]);
            setIsLoading(false);
          }, 2000);
        }, 1500);
      } else {
        // Handle non-PDF files
        alert('Please upload a PDF file');
      }
    }
  };

  const handleTextSelectionAction = (action: 'research' | 'expand' | 'critique', selectedText: string) => {
    let promptPrefix = '';
    
    switch (action) {
      case 'research':
        promptPrefix = 'Can you find supporting research for this idea: ';
        break;
      case 'expand':
        promptPrefix = 'Can you help me expand on this idea: ';
        break;
      case 'critique':
        promptPrefix = 'Can you critique this idea and provide potential counterarguments: ';
        break;
    }
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `${promptPrefix}\n\n"${selectedText}"`,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    
    // Simulate AI response based on the action
    setTimeout(() => {
      let aiResponse: Message;
      
      if (action === 'research') {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Here's some supporting research for your idea about "${selectedText.substring(0, 30)}...":\n\n1. **Smith et al. (2020)** conducted a study that supports this concept, finding that...\n\n2. **The Journal of Educational Psychology (2019)** published research demonstrating...\n\n3. **According to Brown & Johnson's meta-analysis (2021)**, there is strong evidence that...\n\nWould you like me to add any of these as references to your document?`,
          timestamp: new Date(),
        };
      } else if (action === 'expand') {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Here's how you might expand on your idea about "${selectedText.substring(0, 30)}...":\n\n• Consider adding examples from different educational contexts\n• You could connect this to learning theory by explaining how...\n• This concept relates to recent developments in the field, such as...\n• A practical application of this idea would be...\n\nWould you like me to elaborate on any of these points in more detail?`,
          timestamp: new Date(),
        };
      } else { // critique
        aiResponse = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Here's a thoughtful critique of your idea about "${selectedText.substring(0, 30)}...":\n\n• **Alternative perspective:** Some researchers argue that...\n• **Methodological concerns:** The approach mentioned might be limited by...\n• **Contextual limitations:** This concept may not apply equally in all settings because...\n• **Recent contradicting evidence:** Williams & Chen (2022) found that...\n\nAddressing these counterarguments in your writing would strengthen your overall argument.`,
          timestamp: new Date(),
        };
      }
      
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 2000);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
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
        
        {uploadedPdf && (
          <div className="flex justify-center animate-fade-in">
            <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-3 flex items-center gap-2">
              <File className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium">{uploadedPdf.name}</span>
              <button 
                onClick={() => setUploadedPdf(null)}
                className="ml-2 p-1 rounded-full hover:bg-blue-100"
              >
                <X className="h-4 w-4 text-blue-500" />
              </button>
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
            type="button"
            onClick={triggerFileUpload}
            className="p-2 rounded-md transition-colors text-gray-600 hover:bg-gray-100"
          >
            <Upload className="w-5 h-5" />
          </button>
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
          
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="application/pdf"
            className="hidden"
          />
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
