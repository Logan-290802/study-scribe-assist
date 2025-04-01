import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { ChatMessage, Reference } from '@/components/ai/types';
import { 
  createUserMessage,
  createReferenceResponse,
  createSummaryResponse,
  createPdfAnalysisResponse,
  createImageAnalysisResponse,
  createGeneralResponse,
  createProcessingPdfMessage,
  createProcessingImageMessage,
  createSampleReference,
  createReferenceAddedMessage,
  saveChatMessageToSupabase
} from './ai-chat/messageUtils';
import { handleFileUpload, ALLOWED_FILE_TYPES } from './ai-chat/fileUtils';

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

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
        setMessages(convertedMessages);
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
      } else if (uploadedFile) {
        aiResponse = createPdfAnalysisResponse(uploadedFile.name);
        setUploadedFile(null);
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
      setUploadedFile(file);
      
      const userMessage = createUserMessage(`I've uploaded a file: "${file.name}". Can you analyze it for me?`);
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
        
        try {
          await handleFileUpload(file, documentId, userId);
        } catch (error) {
          console.error('Error uploading file:', error);
          toast({
            title: "Upload Error",
            description: "Failed to upload file to storage",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }
      
      // Processing message after short delay
      setTimeout(() => {
        const isImage = file.type.startsWith('image/');
        const processingMessage = isImage 
          ? createProcessingImageMessage(file.name)
          : createProcessingPdfMessage(file.name);
        
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
          const isImage = file.type.startsWith('image/');
          const analysisMessage = isImage
            ? createImageAnalysisResponse(file.name)
            : createPdfAnalysisResponse(file.name);
            
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
    uploadedFile,
    setUploadedFile,
    handleSendMessage,
    handleFileChange,
    addSampleReference
  };
};
