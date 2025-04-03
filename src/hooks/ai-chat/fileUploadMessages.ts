
import { 
  createUserMessage, 
  createProcessingPdfMessage, 
  createProcessingImageMessage,
  createPdfAnalysisResponse,
  createImageAnalysisResponse,
  createErrorMessage,
  saveChatMessageToSupabase
} from './messageUtils';
import { ChatMessage } from '@/components/ai/types';

// Creates and handles the sequence of messages for file upload
export const createFileUploadMessages = async (
  file: File,
  documentId?: string,
  userId?: string,
  setMessages?: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>
) => {
  // Create initial user message about the file upload
  const userMessage = createUserMessage(`I've uploaded a file: "${file.name}". Can you analyze it for me?`);
  
  if (setMessages) {
    setMessages((prev) => [...prev, userMessage]);
  }
  
  // First add the user message to chat history if applicable
  if (userId && documentId) {
    try {
      await saveChatMessageToSupabase({
        role: 'user',
        content: userMessage.content,
        document_id: documentId,
        user_id: userId,
      }, (error) => {
        console.error('Error saving chat message:', error);
      });
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  }
  
  // Returns the error message if needed
  const getErrorMessage = (errorDescription: string, actionNeeded: string = '') => {
    const errorMsg = createErrorMessage(`I'm sorry, I couldn't process your file. ${errorDescription} ${actionNeeded}`);
    if (setMessages) {
      setMessages(prev => [...prev, errorMsg]);
    }
    if (setIsLoading) {
      setIsLoading(false);
    }
    return errorMsg;
  };
  
  // Adds the processing and analysis messages with delays
  const addProcessingAndAnalysisMessages = () => {
    // Processing message after short delay
    setTimeout(() => {
      const isImage = file.type.startsWith('image/');
      const processingMessage = isImage 
        ? createProcessingImageMessage(file.name)
        : createProcessingPdfMessage(file.name);
      
      if (setMessages) {
        setMessages((prev) => [...prev, processingMessage]);
      }
      
      if (userId && documentId) {
        try {
          saveChatMessageToSupabase({
            role: 'assistant',
            content: processingMessage.content,
            document_id: documentId,
            user_id: userId,
          }, (error) => {
            console.error('Error saving processing message:', error);
          });
        } catch (error) {
          console.error('Error saving processing message:', error);
        }
      }
      
      // Analysis message after longer delay
      setTimeout(() => {
        const isImage = file.type.startsWith('image/');
        const analysisMessage = isImage
          ? createImageAnalysisResponse(file.name)
          : createPdfAnalysisResponse(file.name);
          
        if (setMessages) {
          setMessages((prev) => [...prev, analysisMessage]);
        }
        
        if (setIsLoading) {
          setIsLoading(false);
        }
        
        if (userId && documentId) {
          try {
            saveChatMessageToSupabase({
              role: 'assistant',
              content: analysisMessage.content,
              document_id: documentId,
              user_id: userId,
            }, (error) => {
              console.error('Error saving analysis message:', error);
            });
          } catch (error) {
            console.error('Error saving analysis message:', error);
          }
        }
      }, 2000);
    }, 1500);
  };
  
  return {
    userMessage,
    getErrorMessage,
    addProcessingAndAnalysisMessages
  };
};
