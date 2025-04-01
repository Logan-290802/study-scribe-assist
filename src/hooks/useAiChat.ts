
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { ChatMessage, Reference } from '@/components/ai/types';
import { 
  createUserMessage,
  createReferenceResponse,
  createSummaryResponse,
  createPdfAnalysisResponse,
  createGeneralResponse,
  createProcessingPdfMessage,
  createSampleReference,
  createReferenceAddedMessage,
  saveChatMessageToSupabase
} from './ai-chat/messageUtils';
import { handlePdfUpload } from './ai-chat/fileUtils';

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
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI research assistant. I can help you search for information, suggest references, and assist with your academic writing. What can I help you with today?',
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedPdf, setUploadedPdf] = useState<File | null>(null);

  // Initialize with external chat history if provided
  useState(() => {
    if (externalChatHistory && externalChatHistory.length > 0) {
      const convertedMessages = externalChatHistory.map((item, index) => ({
        id: index.toString(),
        role: item.role,
        content: item.content,
        timestamp: new Date()
      }));
      
      if (convertedMessages.length > 0) {
        setMessages([messages[0], ...convertedMessages]);
      }
    }
  });

  const handleSendMessage = async (input: string) => {
    if (!input.trim()) return;

    const userMessage = createUserMessage(input);
    setMessages((prev) => [...prev, userMessage]);
    
    if (documentId && userId) {
      await saveChatMessageToSupabase({
        role: 'user',
        content: input,
        document_id: documentId,
        user_id: userId,
      }, (error) => {
        toast({
          title: "Error",
          description: "Failed to save chat message",
          variant: "destructive",
        });
      });
    }
    
    if (onNewMessage) {
      onNewMessage(input);
      return;
    }
    
    setIsLoading(true);
    
    setTimeout(() => {
      let aiResponse: ChatMessage;
      
      if (input.toLowerCase().includes('reference') || input.toLowerCase().includes('citation')) {
        aiResponse = createReferenceResponse();
      } else if (input.toLowerCase().includes('summarize') || input.toLowerCase().includes('summary')) {
        aiResponse = createSummaryResponse();
      } else if (uploadedPdf) {
        aiResponse = createPdfAnalysisResponse(uploadedPdf.name);
        setUploadedPdf(null);
      } else {
        aiResponse = createGeneralResponse();
      }
      
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
      
      if (documentId && userId) {
        saveChatMessageToSupabase({
          role: 'assistant',
          content: aiResponse.content,
          document_id: documentId,
          user_id: userId,
        }, (error) => {
          toast({
            title: "Error",
            description: "Failed to save chat message",
            variant: "destructive",
          });
        });
      }
    }, 1500);
  };

  const addSampleReference = () => {
    if (!onAddReference) return;
    
    const newReference = createSampleReference();
    onAddReference(newReference);
    
    const confirmationMessage = createReferenceAddedMessage();
    setMessages((prev) => [...prev, confirmationMessage]);
    
    if (userId && documentId) {
      saveChatMessageToSupabase({
        role: 'assistant',
        content: confirmationMessage.content,
        document_id: documentId,
        user_id: userId,
      }, (error) => {
        toast({
          title: "Error",
          description: "Failed to save chat message",
          variant: "destructive",
        });
      });
    }
  };

  const handleFileChange = async (file: File) => {
    try {
      if (file.type === 'application/pdf') {
        setUploadedPdf(file);
        
        const userMessage = createUserMessage(`I've uploaded a PDF: "${file.name}". Can you analyze it for me?`);
        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);
        
        if (userId && documentId) {
          await saveChatMessageToSupabase({
            role: 'user',
            content: userMessage.content,
            document_id: documentId,
            user_id: userId,
          }, (error) => {
            toast({
              title: "Error",
              description: "Failed to save chat message",
              variant: "destructive",
            });
          });
          
          await handlePdfUpload(file, documentId, userId);
        }
        
        // Processing message after short delay
        setTimeout(() => {
          const processingMessage = createProcessingPdfMessage(file.name);
          setMessages((prev) => [...prev, processingMessage]);
          
          if (userId && documentId) {
            saveChatMessageToSupabase({
              role: 'assistant',
              content: processingMessage.content,
              document_id: documentId,
              user_id: userId,
            }, (error) => {
              toast({
                title: "Error",
                description: "Failed to save chat message",
                variant: "destructive",
              });
            });
          }
          
          // Analysis message after longer delay
          setTimeout(() => {
            const analysisMessage = createPdfAnalysisResponse(file.name);
            setMessages((prev) => [...prev, analysisMessage]);
            setIsLoading(false);
            
            if (userId && documentId) {
              saveChatMessageToSupabase({
                role: 'assistant',
                content: analysisMessage.content,
                document_id: documentId,
                user_id: userId,
              }, (error) => {
                toast({
                  title: "Error",
                  description: "Failed to save chat message",
                  variant: "destructive",
                });
              });
            }
          }, 2000);
        }, 1500);
      } else {
        toast({
          title: "Invalid file format",
          description: "Please upload a PDF file",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error handling file:', error);
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to process the file",
        variant: "destructive",
      });
    }
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
