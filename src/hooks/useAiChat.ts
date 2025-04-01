
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from '@/lib/utils/uuid';
import { Reference } from '@/components/ai/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UseAiChatProps {
  documentId?: string;
  userId?: string;
  onAddReference?: (reference: Reference) => void;
  externalChatHistory?: { role: 'user' | 'assistant'; content: string }[];
  onNewMessage?: (message: string) => void;
}

export const useAiChat = ({
  documentId,
  userId,
  onAddReference,
  externalChatHistory,
  onNewMessage
}: UseAiChatProps) => {
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

  useEffect(() => {
    if (externalChatHistory && externalChatHistory.length > 0) {
      const convertedMessages = mapExternalHistoryToMessages(externalChatHistory);
      
      if (convertedMessages.length > 0) {
        setMessages([messages[0], ...convertedMessages]);
      }
    }
  }, [externalChatHistory]);

  const mapExternalHistoryToMessages = (history: { role: 'user' | 'assistant'; content: string }[]): Message[] => {
    return history.map((item, index) => ({
      id: index.toString(),
      role: item.role,
      content: item.content,
      timestamp: new Date()
    }));
  };

  const handleSendMessage = (input: string) => {
    if (!input.trim()) return;

    const userMessage: Message = createNewMessage('user', input);
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

  const createNewMessage = (role: 'user' | 'assistant', content: string): Message => {
    return {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
    };
  };

  const handleAiResponse = (input: string) => {
    let aiResponse: Message;
    
    if (input.toLowerCase().includes('reference') || input.toLowerCase().includes('citation')) {
      aiResponse = createReferenceResponse();
    } else if (input.toLowerCase().includes('summarize') || input.toLowerCase().includes('summary')) {
      aiResponse = createSummaryResponse();
    } else if (uploadedPdf) {
      aiResponse = createPdfAnalysisResponse();
      setUploadedPdf(null);
    } else {
      aiResponse = createDefaultResponse();
    }
    
    setMessages((prev) => [...prev, aiResponse]);
    setIsLoading(false);
    
    if (userId && documentId) {
      saveChatMessageToSupabase({
        role: 'assistant',
        content: aiResponse.content,
        document_id: documentId,
        user_id: userId,
      });
    }
  };

  const createReferenceResponse = (): Message => {
    return {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: "I found this reference that might be helpful for your research on cognitive learning theory:\n\n**Sweller, J., van Merriënboer, J. J. G., & Paas, F. (2019). Cognitive Architecture and Instructional Design: 20 Years Later. Educational Psychology Review, 31(2), 261–292.**\n\nWould you like me to add this to your references list?",
      timestamp: new Date(),
    };
  };

  const createSummaryResponse = (): Message => {
    return {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: "Based on the literature, here's a summary of key points about cognitive load theory:\n\n• Cognitive load theory focuses on the limitations of working memory during learning\n• It identifies three types of cognitive load: intrinsic, extraneous, and germane\n• Instructional design should minimize extraneous load and optimize germane load\n• Split-attention and redundancy effects can impair learning efficiency\n• Schema acquisition and automation are key mechanisms for knowledge transfer\n\nWould you like me to elaborate on any of these points?",
      timestamp: new Date(),
    };
  };

  const createPdfAnalysisResponse = (): Message => {
    if (!uploadedPdf) {
      return createDefaultResponse();
    }
    
    return {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: `I've analyzed the PDF "${uploadedPdf.name}" and here are the key findings:\n\n• The paper discusses cognitive load theory and its applications in education\n• It emphasizes the importance of managing working memory load during instruction\n• The authors propose a new framework for instructional design based on cognitive architecture\n• There are several practical implications for classroom teaching and online learning\n\nWould you like me to provide more specific details about any of these points or generate a citation for this paper?`,
      timestamp: new Date(),
    };
  };

  const createDefaultResponse = (): Message => {
    return {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: "I can help you with that. To provide the most relevant assistance, could you specify if you need:\n\n1. Research information on a particular topic\n2. Help with structuring your argument\n3. Citation suggestions for your current paragraph\n4. Feedback on your writing\n\nAlternatively, you could share a specific paragraph you're working on, or upload a PDF for me to analyze.",
      timestamp: new Date(),
    };
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
    if (!onAddReference) return;
    
    const newReference: Reference = createSampleReference();
    onAddReference(newReference);
    
    const confirmationMessage: Message = createConfirmationMessage();
    setMessages((prev) => [...prev, confirmationMessage]);
    
    if (userId && documentId) {
      saveChatMessageToSupabase({
        role: 'assistant',
        content: confirmationMessage.content,
        document_id: documentId,
        user_id: userId,
      });
    }
  };

  const createSampleReference = (): Reference => {
    return {
      id: uuidv4(),
      title: "Cognitive Architecture and Instructional Design: 20 Years Later",
      authors: ["Sweller, J.", "van Merriënboer, J. J. G.", "Paas, F."],
      year: "2019",
      source: "Educational Psychology Review, 31(2), 261–292",
      url: "https://doi.org/10.1007/s10648-019-09465-5",
      format: "APA",
    };
  };

  const createConfirmationMessage = (): Message => {
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: "I've added this reference to your reference list. You can now cite it in your document.",
      timestamp: new Date(),
    };
  };

  const handleFileChange = async (file: File) => {
    if (file.type === 'application/pdf') {
      setUploadedPdf(file);
      
      const userMessage = createPdfUploadMessage(file.name);
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      
      await handlePdfUpload(file, userMessage);
      
      simulatePdfAnalysis(file);
    } else {
      alert('Please upload a PDF file');
    }
  };

  const createPdfUploadMessage = (fileName: string): Message => {
    return {
      id: Date.now().toString(),
      role: 'user',
      content: `I've uploaded a PDF: "${fileName}". Can you analyze it for me?`,
      timestamp: new Date(),
    };
  };

  const handlePdfUpload = async (file: File, userMessage: Message) => {
    if (userId && documentId) {
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
          
          await savePdfUploadToSupabase(file, filePath);
          
          saveChatMessageToSupabase({
            role: 'user',
            content: userMessage.content,
            document_id: documentId,
            user_id: userId,
          });
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  };

  const savePdfUploadToSupabase = async (file: File, filePath: string) => {
    if (!userId || !documentId) return;
    
    try {
      await supabase.from('file_uploads').insert({
        name: file.name,
        size: file.size,
        type: file.type,
        path: filePath,
        document_id: documentId,
        user_id: userId,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error saving file upload metadata:', error);
    }
  };

  const simulatePdfAnalysis = (file: File) => {
    setTimeout(() => {
      const processingMessage = createProcessingMessage(file.name);
      setMessages((prev) => [...prev, processingMessage]);
      
      if (userId && documentId) {
        saveChatMessageToSupabase({
          role: 'assistant',
          content: processingMessage.content,
          document_id: documentId,
          user_id: userId,
        });
      }
      
      setTimeout(() => {
        const analysisMessage = createAnalysisMessage(file.name);
        setMessages((prev) => [...prev, analysisMessage]);
        setIsLoading(false);
        
        if (userId && documentId) {
          saveChatMessageToSupabase({
            role: 'assistant',
            content: analysisMessage.content,
            document_id: documentId,
            user_id: userId,
          });
        }
      }, 2000);
    }, 1500);
  };

  const createProcessingMessage = (fileName: string): Message => {
    return {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: `I'm analyzing the PDF "${fileName}" now. Give me a moment to process it...`,
      timestamp: new Date(),
    };
  };

  const createAnalysisMessage = (fileName: string): Message => {
    return {
      id: (Date.now() + 2).toString(),
      role: 'assistant',
      content: `I've analyzed the PDF "${fileName}" and here are the key findings:\n\n• The paper discusses cognitive load theory and its applications in education\n• It emphasizes the importance of managing working memory load during instruction\n• The authors propose a new framework for instructional design based on cognitive architecture\n• There are several practical implications for classroom teaching and online learning\n\nWould you like me to provide more specific details about any of these points or generate a citation for this paper?`,
      timestamp: new Date(),
    };
  };

  return {
    messages,
    isLoading,
    uploadedPdf,
    setUploadedPdf,
    handleSendMessage,
    handleFileChange,
    addSampleReference
  };
};
